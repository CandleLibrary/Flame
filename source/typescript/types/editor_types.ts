import { Change, ChangeType } from './transition';

export enum EditorCommand {
    /**
     * A null command that should be ignored
     */
    UNKNOWN,

    NOT_ALLOWED,
    /**
     * Previous command received and processed normally
     */
    OK,

    /**
     * A client instance request for the CSS strings
     * registered for a given component
     */
    GET_COMPONENT_STYLE,
    /**
     * A server response to EditorCommand.GET_COMPONENT_STYLE
     * with a list of style strings registered to the component
     */
    GET_COMPONENT_STYLE_RESPONSE,

    /**
     * A message from a client instance indicating the
     * client has loaded and is ready to communicate with
     * the server. Should result in the initialization of
     * file watchers for the source files that were used
     * to render the endpoint.
     */
    REGISTER_CLIENT_ENDPOINT,

    /**
    * A server response to a EditorCommand.GET_COMPONENT_PATCH
    * request. Client instances should use the ComponentPatch
    * object to patch or replace existing components with
    * modifications made to the latest version.
    */
    APPLY_COMPONENT_PATCH,

    /**
     * A client request to update a givin component to
     * a newer version. Both `to` and `from` must match
     * components that were derived from the same file.
     */
    GET_COMPONENT_PATCH,

    /**
     * A server broadcast message indicating that local changes
     * have been made to a component. If a client instance has
     * any components with a name that matches the `old_name` it
     * should respond with a EditorCommand.GET_COMPONENT_PATCH message
     * to update the old components to the new version.
     */
    UPDATED_COMPONENT,
    GET_COMPONENT_SOURCE,
    GET_COMPONENT_SOURCE_RESPONSE,

    /**
     * Apply a set of changes to affected components, allowing
     * a batch change operation to take place.
     */
    APPLY_COMPONENT_CHANGES
}

export const enum StyleSourceType {
    INLINE,
    CSS_FILE
}

export interface CommandsMap {

    [EditorCommand.OK]: {
        command: EditorCommand.OK;
    };

    [EditorCommand.UNKNOWN]: {
        command: EditorCommand.UNKNOWN;
    };

    [EditorCommand.NOT_ALLOWED]: {
        command: EditorCommand.NOT_ALLOWED;
    };

    [EditorCommand.REGISTER_CLIENT_ENDPOINT]: {
        command: EditorCommand.REGISTER_CLIENT_ENDPOINT;
        /**
         * The API endpoint that this page represents
         */
        endpoint: string;
    };

    [EditorCommand.GET_COMPONENT_STYLE]: {
        command: EditorCommand.GET_COMPONENT_STYLE;
        /**
         * The hash name of the component from which
         * CSS styles should be retrieved
         */
        component_name: string;
    };

    [EditorCommand.GET_COMPONENT_STYLE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_STYLE_RESPONSE;
        component_name: string;
        styles: {
            type: StyleSourceType,
            string: string,
            /**
             * The path to the source file containing
             * the CSS data
             */
            location: string,
        }[];
    };

    [EditorCommand.GET_COMPONENT_PATCH]: {
        command: EditorCommand.GET_COMPONENT_PATCH;
        /**
         * The component old component hash name
         */
        from: string;
        /**
         * The new updated component  hash name
         */
        to: string;
    };

    [EditorCommand.APPLY_COMPONENT_PATCH]: {
        command: EditorCommand.APPLY_COMPONENT_PATCH;
        patch: Patch[PatchType];
    };

    [EditorCommand.UPDATED_COMPONENT]: {
        command: EditorCommand.UPDATED_COMPONENT;
        new_name: string;
        old_name: string;
        path: string;
    };

    [EditorCommand.GET_COMPONENT_SOURCE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE;
        component_name: string;
    };

    [EditorCommand.GET_COMPONENT_SOURCE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE;
        component_name: string;
        source: string;
    };


    [EditorCommand.APPLY_COMPONENT_CHANGES]: {
        command: EditorCommand.APPLY_COMPONENT_CHANGES;
        component_changes: {
            old_component: string;
            changes: (Change[ChangeType.CSSRule] | Change[ChangeType.Attribute])[];
        }[];
    };
}

export type Commands = EditorCommand;

export interface EditMessage<T extends keyof CommandsMap = Commands

    > {
    nonce: number;
    data: CommandsMap[T];
}




export const enum PatchType {
    /**
     * The patch affects the hash name only
     *
     * examples:
     * - Imported module path gets changed
     * -
     *
     * This patch can be issued as a hash name change.
     *
     * This WILL change the component's hash
     */
    STUB,

    /**
     * The style in an external style sheet is changed.
     *
     * This patch can be issued as a set of style updates.
     *
     * This may or may not change the component's hash
     */
    CSS,

    /**
     * A text section defined within the component source file is changed.
     *
     * This patch can be issued as a set of text element changes
     *
     * This WILL change the component's hash
     */
    TEXT,

    /**
     * An element defined within the component source file is changed.
     *
     * This patch is issued as a complete re-render.
     *
     * This WILL change the component's hash
     */
    //ELEMENT,

    /**
     * A binding or any JS code is changed within the source file.
     *
     * This patch is issued as a complete re-render.
     *
     * This WILL change the component's hash
     */
    REPLACE,

    /**
     * Apply an attribute change to an element
     */
    Attribute
}

interface BasePatch {
    type: PatchType;
    /**
     * The hash name string of the two component
     */
    to: string;
    from: string;
}
interface Patch {

    [PatchType.Attribute]: BasePatch & {
        type: PatchType.Attribute,
        name: string,
        value: string;
    };

    [PatchType.REPLACE]: BasePatch & {
        type: PatchType.REPLACE;
        patch_scripts: string[];
    };

    [PatchType.TEXT]: BasePatch & {
        type: PatchType.TEXT;
        patches: {
            index: number;
            from: string;
            to: string;
        }[];
    };

    [PatchType.STUB]: BasePatch & {
        type: PatchType.STUB;
    };

    [PatchType.CSS]: BasePatch & {
        type: PatchType.CSS;
        //The new style to apply to this component
        style: string;
    };
}
