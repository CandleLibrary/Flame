import { Logger } from '@candlelib/log';
import spark, { Sparky } from '@candlelib/spark';
import wick, {
    ComponentData, Presets
} from "@candlelib/wick";
import { ComponentDataClass } from '@candlelib/wick/build/types/compiler/common/component';
import { WebSocket } from "ws";
import URI from '@candlelib/uri';
import { store } from './store.js';
import { getCSSStringFromComponentStyle } from '@candlelib/wick/build/library/compiler/ast-render/css.js';
import { parse, renderCompressed } from '@candlelib/css';
const logger = Logger.createLogger("flame");
import fs from "fs";
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
    send_object(object: any, nonce: number = Infinity) {
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
            command: "updated_component",
            path: component_path,
            old_name: old_component_name,
            new_name: new_component_name
        });
    }

    async command_handler(buffer: Buffer, isBinary: boolean) {

        const { nonce, data } = JSON.parse(buffer.toString());

        logger.get("session").debug(`Received command [ ${data.command} ] with nonce [ ${nonce} ]`);

        switch (data?.command) {

            case "set_component_style": {
                const { component_name, rules } = data;
                const style = parse(rules);
                const comp = wick.rt.presets.components.get(component_name);
                const CSS = comp.CSS;

                CSS[0].data.nodes.push(...style.nodes);

                const location = comp.location;

                const path = URI.resolveRelative(location.filename + ".temp." + location.ext, location);

                fsp.writeFile(path + "", CSS[0].data.pos.replace(
                    renderCompressed(CSS[0].data)
                ));

                console.log(component_name, style, CSS, CSS[0].data.pos.slice());
            } break;


            case "get_component_source": {
                const { component_name } = data;

                const comp = wick.rt.presets.components.get(component_name);

                if (comp) {
                    this.send_object({
                        command: "get_component_source",
                        source: comp.source
                    }, nonce);
                }
            } break;

            case "get_component_style": {

                const { component_name } = data;

                const comp = wick.rt.presets.components.get(component_name);

                if (comp) {

                    const CSS = comp.CSS;

                    this.send_object({
                        command: "get_component_style",
                        component_name,
                        style_strings: CSS.map(i => getCSSStringFromComponentStyle(i, comp))
                    }, nonce);
                } else {
                    this.send_object({
                        component_name,
                        command: "get_component_style",
                        source: []
                    }, nonce);
                }

            } break;

            case "set_component_style": {

            } break;

            case "register_client_endpoint": {

                const { endpoint } = data;

                const { comp } = store.endpoints.get(endpoint) ?? {};

                if (comp) {
                    logger.log(`Registering client with endpoint [ ${endpoint} ]`);
                    this.connect_file_watchers(comp);
                } else {
                    logger.warn(`Failed to register client with endpoint [ ${endpoint} ]`);
                }

            } break;

            case "get_component_patch": {
                // Need to receive the class data necessary to 
                // do an in place replacement of component data
                const { old_name, new_name } = data;

                const patches = [];

                const root_component: ComponentDataClass = store.updated_components.get(new_name);

                for (const comp of getComponentDependencies(root_component)) {

                    const code_patch = await comp.createPatch(wick.rt.presets, old_name);

                    patches.push(code_patch);
                }

                this.send_object({
                    nonce,
                    command: "get_component_patch",
                    old_name,
                    new_name,
                    patches
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

/**
 * Returns a list of all components that are required to
 * properly render the givin root component, 
 * including the root component
 * @param root_component 
 * @returns 
 */
function getComponentDependencies(root_component: ComponentData): Array<ComponentData> {

    const seen_components: Set<string> = new Set();
    const output = [root_component];

    for (const component of output) {

        seen_components.add(component.name);

        for (const [, comp_name] of component.local_component_names)
            if (!seen_components.has(comp_name))
                output.push(wick.rt.presets.components.get(comp_name));
    }

    return output;
}

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

        const comp = await wick(new URI(this.path), wick.rt.presets);

        if (comp.HAS_ERRORS) {


            for (const error of comp.errors)
                logger.log(error);

            // Though shalt remove this offending component from 
            // the system

            wick.rt.presets.components.delete(comp.name);

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