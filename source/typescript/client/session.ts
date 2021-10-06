import { Logger } from '@candlelib/log';
import { Commands, CommandsMap, EditMessage, EditorCommand } from "../common/editor_types.js";

interface CommandHandler<T extends keyof CommandsMap = Commands> {
    (command: CommandsMap[T], session: Session): void;
}

/**
 * The client side counterpart of the server Session class
 */
export class Session {

    connection: WebSocket;

    ACTIVE: boolean;

    awaitable_callback: Map<number, (any) => void>;

    nonce: number;

    logger: Logger;

    dispatches: Map<EditorCommand, CommandHandler>;

    constructor(ws_uri: string) {


        this.logger = Logger.get("flame-client").get("session").activate();

        this.logger.log(`Creating WebSocket connection to [ ${ws_uri} ]`);

        this.connection = new WebSocket(ws_uri);

        this.ACTIVE = true;

        this.awaitable_callback = new Map;

        this.dispatches = new Map;

        this.set_callbacks();

        this.nonce = 0;
    }

    setHandler<T extends keyof CommandsMap = Commands>(command: T, handler: CommandHandler<T>) {
        this.dispatches.set(command, handler);
    }

    set_callbacks() {

        this.connection.addEventListener("message", this.command_handler.bind(this));

        this.connection.addEventListener("close", this.close_handler.bind(this));

        this.connection.addEventListener("error", this.error_handler.bind(this));

        this.connection.addEventListener("open", this.open_handler.bind(this));
    }

    /**
       * Convert an object to JSON and send to
       * client.
       */
    send_command<T extends keyof CommandsMap>(
        object: CommandsMap[T],
        nonce: number = Infinity
    ) {
        const json = JSON.stringify({ data: object, nonce });
        this.connection.send(json);
    }
    send_awaitable_command<T extends keyof CommandsMap, R extends keyof CommandsMap>(
        obj: CommandsMap[T]
    ): Promise<CommandsMap[R]> {
        return new Promise(res => {
            const nonce = this.nonce++;
            this.awaitable_callback.set(nonce, res);
            this.send_command(obj, nonce);
        });
    }

    open_handler() {

        const path = document.location.pathname || "/";

        this.logger.log(`Connection to [ ${this.connection.url} ] established`);

        this.send_command({ command: EditorCommand.REGISTER_CLIENT_ENDPOINT, endpoint: path });

        this.ACTIVE = true;
    }

    close_handler() { this.ACTIVE = false; };

    error_handler(error: Error) {

        this.logger.error(error);
    }

    async command_handler(msg: MessageEvent) {

        const { nonce, data } = <EditMessage>JSON.parse(msg.data);

        this.logger.log(`Received command [ ${EditorCommand[data.command]} ] with nonce [ ${nonce} ]`);

        if (this.awaitable_callback.has(nonce)) {

            const callback = this.awaitable_callback.get(nonce);

            this.awaitable_callback.delete(nonce);

            return callback(data);
        } else if (this.dispatches.has(data.command))
            this.dispatches.get(data.command)(data, this);
        else
            this.logger.warn(`No handler set for command [ ${EditorCommand[data.command]} ]`);
    }
}