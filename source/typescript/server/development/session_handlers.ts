import URI from '@candlelib/uri';
import wick, {
    ComponentData, componentDataToCSS
} from "@candlelib/wick";
import { getCSSStringFromComponentStyle } from '@candlelib/wick/build/library/compiler/ast-render/css.js';
import fs from "fs";
import spark from '@candlelib/spark';
import { CommandHandler } from '../../common/session.js';
import { EditorCommand, PatchType, StyleSourceType } from '../../types/editor_types.js';
import { ChangeType } from '../../types/transition.js';
import { ChangeToken, getAttributeChangeToken, getCSSChangeToken } from './change_token.js';
import {
    alertSessionsOfComponentTransition,
    createNewComponentFromSourceString,
    getSourceHash
} from './component_tools.js';
import { ServerSession } from './session.js';
import { addBareComponent, addComponent, addTransition, getComponent, getTransition, store, __sessions__ } from './store.js';
const fsp = fs.promises;

export function initializeDefualtSessionDispatchHandlers(session: ServerSession) {
    session.setHandler(EditorCommand.REGISTER_CLIENT_ENDPOINT, REGISTER_CLIENT_ENDPOINT);
    session.setHandler(EditorCommand.GET_COMPONENT_SOURCE, GET_COMPONENT_SOURCE);
    session.setHandler(EditorCommand.GET_COMPONENT_STYLE, GET_COMPONENT_STYLE);
    session.setHandler(EditorCommand.GET_COMPONENT_PATCH, GET_COMPONENT_PATCH);
    session.setHandler(EditorCommand.APPLY_COMPONENT_CHANGES, APPLY_COMPONENT_CHANGES);
    return session;
}

export async function writeComponent(component: ComponentData) {

    const location = component.location;

    const path = URI.resolveRelative(location.filename + ".temp." + location.ext, location);

    await fsp.writeFile(path + "", component.source);
}

async function writeComponentSource(component_source: string, location: URI) {

    const path = URI.resolveRelative(location.filename + ".temp." + location.ext, location);

    await fsp.writeFile(location + "", component_source);
}

const APPLY_COMPONENT_CHANGES: CommandHandler<EditorCommand.APPLY_COMPONENT_CHANGES>
    = async function (command, session: ServerSession) {

        for (const { old_component, changes } of command.component_changes) {

            const change_tokens: ChangeToken[] = [];

            const comp = await getComponent(old_component);

            for (const change of changes) {

                if (change.type == ChangeType.CSSRule) {
                    change_tokens.push(await getCSSChangeToken(old_component, change));
                } else if (change.type == ChangeType.Attribute) {
                    change_tokens.push(await getAttributeChangeToken(old_component, change));
                }
            }
            const new_source = change_tokens.sort((a, b) => a.token.off - b.token.off).reduce((source,
                { token, string }) =>
                token.setSource(source).replace(string), change_tokens[0].token.source);

            const new_component = getSourceHash(new_source);

            addBareComponent(new_component, new_source, comp.location);

            addTransition({
                new_id: new_component,
                old_id: old_component,
                new_location: comp.location + "",
                old_location: comp.location + "",
                changes: changes,
                source: new_source
            });

            alertSessionsOfComponentTransition(
                __sessions__,
                new_component,
                old_component,
                comp.location
            );

            await writeComponentSource(new_source, comp.location);

        }

        await spark.sleep(100);

        return { command: EditorCommand.OK };
    };

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


const GET_COMPONENT_SOURCE: CommandHandler<EditorCommand.GET_COMPONENT_SOURCE>
    = async function (command, session: ServerSession) {
        const { component_name } = command;

        const comp = await getComponent(component_name);

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

        const comp = await getComponent(component_name);


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
                    string: getCSSStringFromComponentStyle(i, comp, false)
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

        if (from == to)
            return {
                command: EditorCommand.NOT_ALLOWED
            };

        const transition = getTransition(from, to);

        if (!transition)
            return {
                command: EditorCommand.UNKNOWN
            };

        const changes = transition.changes;

        if (changes.some(g => g.type == ChangeType.General)) {
            // The general change type should cover all changes
            // and cause a rerender patch to be issued
        } else {

            //Issue a CSS patch
            return {
                command: EditorCommand.APPLY_COMPONENT_PATCH,
                patch: {
                    type: PatchType.CSS,
                    from: from,
                    to: to,
                    style: componentDataToCSS(await getComponent(to))
                }
            };
        }
    };

