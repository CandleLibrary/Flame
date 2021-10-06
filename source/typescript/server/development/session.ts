import { parse, renderCompressed } from '@candlelib/css';
import { Logger } from '@candlelib/log';
import spark, { Sparky } from '@candlelib/spark';
import URI from '@candlelib/uri';
import wick, {
    ComponentData
} from "@candlelib/wick";
import { getCSSStringFromComponentStyle } from '@candlelib/wick/build/library/compiler/ast-render/css.js';
import fs from "fs";
import { WebSocket } from "ws";
import { addStyle, CommandsMap, createStubPatch, EditMessage, EditorCommand, getComponentDependencies, getPatch } from './component_tools.js';
import { store } from './store.js';
const logger = Logger.createLogger("flame");
const fsp = fs.promises;




/**
 * This class binds to a WebSocket connection and
 * maintains synchronization between client view and
 * server side source files.
 */
export class Session {
    /**
     * The path to the endpoint component opened
     * in the client browser.
     */
    active_component_path: string;
    /**
     * Timestamp of the creation of this session
     */
    opened: number;

    /**
     * Timestamp of the last update of this session
     * (client side or server side)
     */
    last_update: number;

    /**
     * The active websocket connection instance.
     */
    connection: WebSocket;

    /**
     * true if the current connection is available
     * to send and receive data.
     */
    ACTIVE: boolean;

    constructor(
        connection: WebSocket,
    ) {

        this.connection = connection;

        this.ACTIVE = true;

        this.set_callbacks();

        sessions.push(this);
    };

    /**
     * Convert an object to JSON and send to
     * client.
     */
    send_object<T extends keyof CommandsMap>(
        object: CommandsMap[T], nonce: number = Infinity) {
        const json = JSON.stringify({ nonce, data: object });
        this.connection.send(json);
    }

    set_callbacks() {

        this.connection.on("message", this.command_handler.bind(this));

        this.connection.on("close", this.close_handler.bind(this));

        this.connection.on("error", this.error_handler.bind(this));

        this.connection.on("open", this.open_handler.bind(this));
    }

    open_handler() { this.ACTIVE = true; }
    close_handler() { this.ACTIVE = false; };

    error_handler(error: Error) {
        logger.error(error);
    }

    handle_updated_component(
        component_path,
        old_component_name,
        new_component_name
    ) {

        this.send_object({
            command: EditorCommand.UPDATED_COMPONENT,
            path: component_path,
            old_name: old_component_name,
            new_name: new_component_name
        });
    }

    async command_handler(buffer: Buffer, isBinary: boolean) {

        const { nonce, data } = <EditMessage>JSON.parse(buffer.toString());

        logger.get("session").debug(`Received command [ ${data.command} ] with nonce [ ${nonce} ]`);

        switch (data?.command) {

            case EditorCommand.SET_COMPONENT_STYLE: {
                const { component_name, rules } = data;

                const style = parse(rules);

                const comp = wick.rt.context.components.get(component_name);

                const new_comp = await addStyle(
                    comp,
                    wick.rt.context,
                    rules
                );

                const location = new_comp.location;

                const path = URI.resolveRelative(location.filename + ".temp." + location.ext, location);

                await fsp.writeFile(path + "", new_comp.source);

                this.send_object({
                    command: EditorCommand.APPLY_COMPONENT_PATCH,
                    patch: createStubPatch(comp, new_comp)
                }, nonce);

                console.log(component_name, style, CSS, CSS[0].data.pos.slice());

            } break;


            case EditorCommand.GET_COMPONENT_SOURCE: {
                const { component_name } = data;

                const comp = wick.rt.context.components.get(component_name);

                if (comp) {
                    this.send_object({
                        command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE,
                        component_name,
                        source: comp.source
                    }, nonce);
                }
            } break;

            case EditorCommand.GET_COMPONENT_STYLE: {

                const { component_name } = data;

                const comp = wick.rt.context.components.get(component_name);

                if (comp) {

                    const CSS = comp.CSS;

                    this.send_object({
                        command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
                        component_name,
                        style_strings: CSS.map(i => getCSSStringFromComponentStyle(i, comp))
                    }, nonce);
                } else {
                    this.send_object({
                        component_name,
                        command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
                        style_strings: []
                    }, nonce);
                }

            } break;

            case EditorCommand.REGISTER_CLIENT_ENDPOINT: {

                const { endpoint } = data;

                const { comp } = store.endpoints.get(endpoint) ?? {};

                if (comp) {
                    logger.log(`Registering client with endpoint [ ${endpoint} ]`);
                    this.connect_file_watchers(comp);
                } else {
                    logger.warn(`Failed to register client with endpoint [ ${endpoint} ]`);
                }

            } break;

            case EditorCommand.GET_COMPONENT_PATCH: {

                // Need to receive the class data necessary to 
                // do an in place replacement of component data
                const { from, to } = data;

                this.send_object({
                    command: EditorCommand.APPLY_COMPONENT_PATCH,
                    patch: await getPatch(
                        wick.rt.context.components.get(from),
                        wick.rt.context.components.get(to),
                        wick.rt.context
                    )
                }, nonce);

            } break;
        }
    }

    connect_file_watchers(component: ComponentData) {

        const to_watch_component_paths: Array<string>
            = getComponentDependencies(component)
                .map(comp => comp.location + "");

        for (const path of to_watch_component_paths)
            getPageWatcher(path).addSession(this);

    }
};

let watchers: Map<string, FileWatcherHandler> = new Map();
let sessions = [];



export function getPageWatcher(location: string) {

    if (!watchers.has(location))
        watchers.set(location, new FileWatcherHandler(location + ""));

    return watchers.get(location);
}


class FileWatcherHandler implements Sparky {

    _SCHD_: number;
    watcher: fs.FSWatcher;
    path: string;
    type: "change" | string;

    sessions: Set<Session>;

    constructor(path) {

        this.sessions = new Set;

        this.path = path;

        this.type = "";
        this.watcher = null;
    }

    addSession(session: Session) {
        this.sessions.add(session);

        if (!this.watcher) {

            logger.log(`Creating watcher for file [ ${this.path} ]`);
            this.watcher = fs.watch(this.path, (r) => (this.type = r, spark.queueUpdate(this)));
        }
    }

    removeSession(session: Session) {

        this.sessions.delete(session);

        if (this.sessions.size == 0) {
            this.close();
        }
    }

    close() { this.watcher.close(); this.watcher = null; };

    async scheduledUpdate() {

        this.type = "";

        const comp = await wick(new URI(this.path), wick.rt.context);

        if (comp.HAS_ERRORS) {


            for (const error of comp.errors)
                logger.log(error);

            // Though shalt remove this offending component from 
            // the system

            wick.rt.context.components.delete(comp.name);

        } else {

            const { comp: existing } = store.components.get(this.path);

            if (existing.name != comp.name) {

                store.updated_components.set(comp.name, comp);

                for (const endpoint of store.page_components.get(this.path)?.endpoints ?? [])
                    store.endpoints.set(endpoint, { comp });

                store.components.set(this.path, { comp });

                logger.log(`Created new component [ ${comp.name} ] from path [ ${this.path} ] `);

                for (const session of this.sessions) {
                    session.handle_updated_component(
                        this.path,
                        existing.name,
                        comp.name,
                    );
                }
            }
        }
    }
}

export function cleanUpSessions() {

}