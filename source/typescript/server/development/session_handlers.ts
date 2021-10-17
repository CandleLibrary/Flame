import URI from '@candlelib/uri';
import wick, {
    ComponentData
} from "@candlelib/wick";
import { getCSSStringFromComponentStyle } from '@candlelib/wick/build/library/compiler/ast-render/css.js';
import { getElementAtIndex } from '@candlelib/wick/build/library/compiler/common/html.js';
import fs from "fs";
import { EditorCommand, StyleSourceType } from '../../common/editor_types.js';
import { CommandHandler } from '../../common/session.js';
import { createNewComponentFromSourceString, createStubPatch, getPatch, updateStyle } from './component_tools.js';
import { ServerSession } from './session.js';
import { store } from './store.js';
const fsp = fs.promises;

export function initializeDefualtSessionDispatchHandlers(session: ServerSession) {
    session.setHandler(EditorCommand.REGISTER_CLIENT_ENDPOINT, REGISTER_CLIENT_ENDPOINT);
    session.setHandler(EditorCommand.SET_COMPONENT_ELEMENT_ID, SET_COMPONENT_ELEMENT_ID);
    session.setHandler(EditorCommand.ADD_COMPONENT_ELEMENT_CLASS, ADD_COMPONENT_ELEMENT_CLASS);
    session.setHandler(EditorCommand.SET_COMPONENT_STYLE, SET_COMPONENT_STYLE);
    session.setHandler(EditorCommand.GET_COMPONENT_SOURCE, GET_COMPONENT_SOURCE);
    session.setHandler(EditorCommand.GET_COMPONENT_STYLE, GET_COMPONENT_STYLE);
    session.setHandler(EditorCommand.GET_COMPONENT_PATCH, GET_COMPONENT_PATCH);
    return session;
}

async function writeComponent(component: ComponentData) {

    const location = component.location;

    const path = URI.resolveRelative(location.filename + ".temp." + location.ext, location);

    await fsp.writeFile(path + "", component.source);
}

const REGISTER_CLIENT_ENDPOINT: CommandHandler<EditorCommand.REGISTER_CLIENT_ENDPOINT>
    = async function (command, session: ServerSession) {

        const { endpoint } = command;

        const { comp } = store.endpoints.get(endpoint) ?? {};

        if (comp) {
            session.logger.log(`Registering client with endpoint [ ${endpoint} ]`);
            session.connect_file_watchers(comp);
        } else {
            session.logger.warn(`Failed to register client with endpoint [ ${endpoint} ]`);
        }

    };
/**
 * Assumes the editor will automatically update its own 
 * runtime components with the new ID value.
 */

const SET_COMPONENT_ELEMENT_ID: CommandHandler<EditorCommand.SET_COMPONENT_ELEMENT_ID>
    = async function (command, session: ServerSession) {

        const { component_name, id, element_index } = command;

        const comp = wick.rt.context.components.get(component_name);

        const ele = getElementAtIndex(comp, element_index);

        if (ele.attributes.some(s => s.name == "m:d")) {
            return {
                command: EditorCommand.NOT_ALLOWED,
            };
        } else {

            let new_source = "";

            for (const { name, value, pos } of ele.attributes) {
                if (name == "id" && typeof value == "string") {
                    new_source = pos.replace(`id="${id}"`);
                    break;
                }
            }

            if (!new_source)
                new_source = ele.pos.token_slice(1 + ele.tag.length, 1 + ele.tag.length).replace(` id="${id}"`);

            const new_comp = await createNewComponentFromSourceString(
                new_source,
                wick.rt.context,
                comp
            );

            await writeComponent(new_comp);

            return {
                command: EditorCommand.APPLY_COMPONENT_PATCH,
                patch: createStubPatch(comp, new_comp)
            };
        }

    };

/**
 * Assumes the editor will automatically update its own 
 * runtime components with the new class values.
 */
const ADD_COMPONENT_ELEMENT_CLASS: CommandHandler<EditorCommand.ADD_COMPONENT_ELEMENT_CLASS>
    = async function (command, session: ServerSession) {

        const { component_name, element_index, class_names } = command;

        const comp = wick.rt.context.components.get(component_name);

        const ele = getElementAtIndex(comp, element_index);

        if (ele.attributes.some(s => s.name == "m:d")) {
            return {
                command: EditorCommand.NOT_ALLOWED,
            };
        } else {

            let new_source = "";

            for (const { name, value, pos } of ele.attributes) {
                if (name == "class" && typeof value == "string") {
                    const names = new Set([...value.split(" "), ...class_names]);
                    new_source = pos.replace(`"class"="${[...names].join(" ")}"`);
                    break;
                }
            }

            if (!new_source)
                new_source = ele.pos.token_slice(1 + ele.tag.length, 1 + ele.tag.length)
                    .replace(`"class"="${[...class_names].join(" ")}"`);

            const new_comp = await createNewComponentFromSourceString(
                new_source,
                wick.rt.context,
                comp
            );

            await writeComponent(new_comp);

            return {
                command: EditorCommand.APPLY_COMPONENT_PATCH,
                patch: createStubPatch(comp, new_comp)
            };
        }

    };

const SET_COMPONENT_STYLE: CommandHandler<EditorCommand.SET_COMPONENT_STYLE>
    = async function (command, session: ServerSession) {

        const { component_name, rules } = command;

        const comp = wick.rt.context.components.get(component_name);

        for (const rule of rules) {
            const location = new URI(rule.location);
            const css_patch = await updateStyle(
                rule.location || comp.location + "",
                rule.rule_path,
                rule.selectors,
                rule.properties,
                wick.rt.context
            );

            session.send_command({
                command: EditorCommand.APPLY_COMPONENT_PATCH,
                patch: css_patch
            });
        }

    };


const GET_COMPONENT_SOURCE: CommandHandler<EditorCommand.GET_COMPONENT_SOURCE>
    = async function (command, session: ServerSession) {
        const { component_name } = command;

        const comp = wick.rt.context.components.get(component_name);

        if (comp) {
            return {
                command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE,
                component_name,
                source: comp.source
            };
        } else {
            return {
                command: EditorCommand.UNKNOWN
            };
        }
    };

const GET_COMPONENT_STYLE: CommandHandler<EditorCommand.GET_COMPONENT_STYLE>
    = async function (command, session: ServerSession) {

        const { component_name } = command;

        const comp = wick.rt.context.components.get(component_name);


        if (comp) {

            const CSS = comp.CSS;

            return {
                command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
                component_name,
                styles: CSS.map(i => ({
                    location: i.location + "",
                    type: i.location.ext == "css"
                        ? StyleSourceType.CSS_FILE
                        : StyleSourceType.INLINE,
                    string: getCSSStringFromComponentStyle(i, comp)
                }))
            };
        } else {
            return {
                component_name,
                command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE,
                styles: []
            };
        }
    };

const GET_COMPONENT_PATCH: CommandHandler<EditorCommand.GET_COMPONENT_PATCH>
    = async function (command, session: ServerSession) {

        // Need to receive the class data necessary to 
        // do an in place replacement of component data
        const { from, to } = command;

        return {
            command: EditorCommand.APPLY_COMPONENT_PATCH,
            patch: await getPatch(
                wick.rt.context.components.get(from),
                wick.rt.context.components.get(to),
                wick.rt.context
            )
        };
    };