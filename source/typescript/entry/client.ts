import { Logger } from "@candlelib/log";
import { WickLibrary, WickRTComponent } from '@candlelib/wick';
import { parse } from "@candlelib/css";
import { CommandsMap, EditMessage, EditorCommand, Patch, PatchType } from '../server/development/component_tools';


const wick: WickLibrary = <any>window["wick"];

const logger = Logger.createLogger("flame-client");

logger.activate();

window.addEventListener("load", () => {

    document.title = "FLAMMING WICK";

    const host = document.location.hostname;
    const port = document.location.port;
    const protocol = "ws";
    const uri = `${protocol}://${host}:${port}`;

    logger.log(`Creating WebSocket connection to [ ${uri} ]`);

    const session = new Session(new WebSocket(uri));

    let css_handlers = new WeakMap();

    document.addEventListener("click", e => {

        const { target } = e;

        if (
            target instanceof HTMLElement
            &&
            !css_handlers.has(target)
        ) {
            css_handlers.set(target, new CSSHandler(target, session));
        }
        //Resolve target to a component 
    });

    //Initialize Flame Editor Overlay
    initializeEditorFrame();

});

function initializeEditorFrame() {
    const editor_frame = document.createElement("iframe");
    editor_frame.src = "/flame-editor/";
    editor_frame.style.width = "100%";
    editor_frame.style.height = "100%";
    editor_frame.style.position = "fixed";
    editor_frame.style.boxSizing = "border-box";
    editor_frame.style.top = "0";
    editor_frame.style.left = "0";
    editor_frame.style.border = "1px solid black";
    editor_frame.style.pointerEvents = "none";
    editor_frame.style.zIndex = "1000000";
    document.body.appendChild(editor_frame);
    //TODO: Establish com. channels
};



/**
 * The client side counterpart of the server Session class
 */
class Session {

    connection: WebSocket;

    ACTIVE: boolean;

    awaitable_callback: Map<number, (any) => void>;

    nonce: number;
    constructor(connection: WebSocket) {

        this.connection = connection;

        this.ACTIVE = true;

        this.awaitable_callback = new Map;

        this.set_callbacks();

        this.nonce = 0;
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

        logger.log(`Connection to [ ${this.connection.url} ] established`);

        this.send_command({ command: EditorCommand.REGISTER_CLIENT_ENDPOINT, endpoint: path });

        this.ACTIVE = true;
    }

    close_handler() { this.ACTIVE = false; };

    error_handler(error: Error) {

        logger.error(error);
    }

    async command_handler(msg: MessageEvent) {

        const { nonce, data } = <EditMessage>JSON.parse(msg.data);

        if (this.awaitable_callback.has(nonce)) {

            logger.get("session").debug(`Received command [ ${EditorCommand[data.command]} ] with nonce [ ${nonce} ]`);

            const callback = this.awaitable_callback.get(nonce);

            this.awaitable_callback.delete(nonce);

            return callback(data);
        }

        switch (data.command) {

            case EditorCommand.UPDATED_COMPONENT: {
                //Proceed to replace all components

                const { new_name, old_name, path } = data;

                // Identify all top_level components that need to be update. 
                const matches = getRootMatchingComponents(old_name);

                if (matches.length > 0)
                    this.send_command({ command: EditorCommand.GET_COMPONENT_PATCH, to: new_name, from: old_name });

            } break;

            case EditorCommand.APPLY_COMPONENT_PATCH: {

                const patch = data.patch;

                switch (patch.type) {

                    case PatchType.STUB: {

                        const { to, from } = patch;

                        const matches = getRootMatchingComponents(from);

                        for (const match of matches) {

                            match.name = to;
                        }
                    } break;

                    case PatchType.TEXT: {

                        const { to, from, patches } = patch;

                        const matches = getRootMatchingComponents(from);

                        for (const match of matches) {

                            const ele = match.ele;

                            match.name = to;

                            let eles = [ele];

                            for (const patch of patches) {


                                for (const ele of eles) {
                                    if (ele instanceof Text) {
                                        if (ele.data.trim() == patch.from.trim()) {
                                            ele.data = patch.to;
                                            break;
                                        }
                                    }

                                    for (const child of Array.from(ele.childNodes)) {
                                        eles.push(child);
                                    }
                                }
                            }
                        }
                    } break;

                    case PatchType.REPLACE: {

                        const { to, from, patch_scripts } = patch;

                        //Install the patches
                        const classes: typeof WickRTComponent[] = patch_scripts.map(
                            patch => Function("wick", patch)(wick)
                        );

                        const class_ = classes[0];

                        const matches = getRootMatchingComponents(from);

                        for (const match of matches) {

                            // Do some patching magic to replace the old component 
                            // with the new one. 

                            const ele = match.ele;
                            const par_ele = ele.parentElement;
                            const par_comp = match.par;

                            const new_component = new class_(
                                match.model,
                                undefined,
                                undefined,
                                [],
                                undefined,
                                wick.rt.context,
                            );

                            if (par_ele)

                                par_ele.replaceChild(new_component.ele, ele);

                            if (par_comp) {

                                const index = par_comp.ch.indexOf(match);

                                if (index >= 0) {
                                    par_comp.ch.splice(index, 1, new_component);
                                    new_component.par = par_comp;
                                }

                                match.par = null;
                            }

                            new_component.initialize(match.model);

                            match.disconnect();
                            match.destructor();

                            if (removeRootComponent(match)) {
                                addRootComponent(new_component);
                            }
                        }
                    } break;
                }

            } break;
        }
    }

}


/**
 * Binds to an element and handles the CSS
 * transformation of the element and it's 
 * component from within the client 
 */
class CSSHandler {

    ele: HTMLElement;

    component: string;

    session: Session;

    constructor(
        ele: HTMLElement,
        session: Session
    ) {

        this.ele = ele;

        this.component = this.getRootComponentName(ele);

        this.session = session;

        if (this.component)
            this.getComponentCSS(this.component);
    }

    getRootComponentName(ele: HTMLElement) {

        while (ele) {

            if (ele.hasAttribute("wrt:c")) {

                return ele.getAttribute("wrt:c");
            }

            ele = ele.parentElement;
        }

        logger.warn("Unable to resolve the component of a selected element");

        return "";
    }

    getActiveComponent(): WickRTComponent {
        return null;
    }

    async getComponentCSS(component: string) {

        const { component_name, style_strings }
            = await this.session.send_awaitable_command<
                EditorCommand.GET_COMPONENT_STYLE,
                EditorCommand.GET_COMPONENT_STYLE_RESPONSE
            >({
                command: EditorCommand.GET_COMPONENT_STYLE,
                component_name: component
            });

        const styles = style_strings.map(s => parse(s));

        this.ele.style.color = "red";

        const rule_string = `${this.ele.tagName.toLocaleLowerCase()}{color:red}`;

        const rule = parse(rule_string);

        console.log(rule);

        this.session.send_command({
            command: EditorCommand.SET_COMPONENT_STYLE,
            component_name,
            rules: rule_string
        });

        console.log({ component_name, styles });
    }
}




function getRootMatchingComponents(name: string): WickRTComponent[] {

    //Traverse dom structure and identify all components


    const candidates = wick.rt.root_components.slice();

    const output = [];

    for (const candidate of candidates) {
        if (candidate.name == name)
            output.push(candidate);
        else
            candidates.push(...candidate.ch);
    }

    return output;
}

function removeRootComponent(comp: WickRTComponent): boolean {

    const index = wick.rt.root_components.indexOf(comp);

    if (index >= 0)
        wick.rt.root_components.splice(index, 1);

    return index >= 0;

}

function addRootComponent(comp: WickRTComponent) {

    wick.rt.root_components.push(comp);
}