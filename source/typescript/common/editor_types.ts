export enum EditorCommand {
    /**
     * A null command that should be ignored
     */
    UNDEFINED,

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
     * A client instance request to update a given component
     * with new style rules. This will result in a new component
     * that has the applied rules. The server should respond
     * with a EditorCommand.APPLY_COMPONENT_PATCH message
     * with StubPatch configure with the new components
     * hash name
     */
    SET_COMPONENT_STYLE,
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
    GET_COMPONENT_SOURCE_RESPONSE
}

export interface CommandsMap {

    [EditorCommand.UNDEFINED]: {
        command: EditorCommand.UNDEFINED;
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
        component_name: string;
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
        style_strings: string[];
    };

    [EditorCommand.SET_COMPONENT_STYLE]: {
        command: EditorCommand.SET_COMPONENT_STYLE;
        /**
         * The hash name of the component that the new
         * style rules should be applied to.
         */
        component_name: string;
        /**
         * A style sheet string of rules to apply to
         * the component
         */
        rules: string;
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
        patch: Patch;
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
}

export type Commands = EditorCommand.UNDEFINED |
    EditorCommand.GET_COMPONENT_STYLE |
    EditorCommand.GET_COMPONENT_STYLE_RESPONSE |
    EditorCommand.SET_COMPONENT_STYLE |
    EditorCommand.REGISTER_CLIENT_ENDPOINT |
    EditorCommand.APPLY_COMPONENT_PATCH |
    EditorCommand.GET_COMPONENT_PATCH |
    EditorCommand.UPDATED_COMPONENT |
    EditorCommand.GET_COMPONENT_SOURCE |
    EditorCommand.GET_COMPONENT_SOURCE_RESPONSE;

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
     * This WILL NOT change the component's hash
     */
    EXTERNAL_CSS,

    /**
     * A style defined within the component source file is changed.
     *
     * This patch can be issued as a set of style updates and
     * hash name change.
     *
     * This WILL change the component's hash
     */
    INTERNAL_CSS,

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
    ELEMENT,

    /**
     * A binding or any JS code is changed within the source file.
     *
     * This patch is issued as a complete re-render.
     *
     * This WILL change the component's hash
     */
    REPLACE
}
interface ComponentPatch {
    type: PatchType;
    /**
     * The hash name string of the two component
     */
    to: string;
    from: string;
}
interface ReplacePatch extends ComponentPatch {
    type: PatchType.REPLACE;
    patch_scripts: string[];

}
export interface TextPatch extends ComponentPatch {
    type: PatchType.TEXT;
    patches: {
        index: number;
        from: string;
        to: string;
    }[];
}
export interface StubPatch extends ComponentPatch {
    type: PatchType.STUB;
}

export type Patch = ReplacePatch | TextPatch | StubPatch;
