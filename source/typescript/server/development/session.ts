import { Logger } from '@candlelib/log';
import {
    ComponentData
} from "@candlelib/wick";
import { WebSocket } from "ws";
import { Session } from '../../common/session.js';
import { getComponentDependencies } from './component_tools.js';
import { getPageWatcher } from './file_watcher.js';
import { __sessions__ } from './store.js';

export const logger = Logger.createLogger("flame");


/**
 * This class binds to a WebSocket connection and
 * maintains synchronization between client view and
 * server side source files.
 */
export class ServerSession extends Session {
    /**
     * The path to the endpoint component opened
     * in the client browser.
     */
    active_component_path: string;


    /**
     * Timestamp of the last update of this session
     * (client side or server side)
     */
    last_update: number;

    constructor(
        connection: WebSocket,
    ) {
        super(connection, logger);

        __sessions__.push(<any>this);
    };

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
    get_message_string(msg) {
        return msg.toString();
    }

    connect_file_watchers(component: ComponentData) {

        const to_watch_component_paths: Array<string>
            = getComponentDependencies(component)
                .map(comp => comp.location + "");

        for (const path of to_watch_component_paths)
            getPageWatcher(path).addSession(<any>this);

    }
};

