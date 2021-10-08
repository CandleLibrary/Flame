export enum EditorCommand {
    /**
     * A null command that should be ignored
     */
    UNKNOWN,

    NOT_ALLOWED,

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
     * A client instance request to update a given component
     * element with a new ID attribute. This will result in a new 
     * component that has the targeted element id set. 
     * 
     * The server should respond with a EditorCommand.APPLY_COMPONENT_PATCH 
     * message with a StubPatch configured with the new component's
     * hash name.
     * 
     * This however will not work for synthetic elements generated 
     * from markdown markup. In such cases the server will respond with
     * a message an EditorCommand.NOT_ALLOWED command message.
     */
    SET_COMPONENT_ELEMENT_ID,

    /**
     * A client instance request to update a given component
     * element with a class name addition. This will result in a new 
     * component that has the new class appended to the target component's 
     * class attribute. 
     * 
     * The server should respond with a EditorCommand.APPLY_COMPONENT_PATCH 
     * message with a StubPatch configured with the new component's
     * hash name.
     * 
     * This however will not work for synthetic elements generated 
     * from markdown markup. In such cases the server will respond with
     * a message an EditorCommand.NOT_ALLOWED command message.
     */
    ADD_COMPONENT_ELEMENT_CLASS,


    /**
     * A client instance request to update a given component
     * element a with class name removal. This will result in a new 
     * component that has the class removed from the target component's 
     * class attribute. 
     * 
     * The server should respond with a EditorCommand.APPLY_COMPONENT_PATCH 
     * message with a StubPatch configured with the new component's
     * hash name.
     * 
     * This however will not work for synthetic elements generated 
     * from markdown markup. In such cases the server will respond with
     * a message an EditorCommand.NOT_ALLOWED command message.
     */
    REMOVE_COMPONENT_ELEMENT_CLASS,


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

export const enum StyleSourceType {
    INLINE,
    CSS_FILE
}

export interface CommandsMap {

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

    [EditorCommand.REMOVE_COMPONENT_ELEMENT_CLASS]: {
        command: EditorCommand.REMOVE_COMPONENT_ELEMENT_CLASS;

        /**
         * The hash name of the component that the new
         * style rules should be applied to.
         */
        component_name: string;

        /**
         * The element id of the target element. 
         */
        ele_id: number;

        /**
         * class names to remove from the element.
         */
        class_names: string[];
    };

    [EditorCommand.ADD_COMPONENT_ELEMENT_CLASS]: {
        command: EditorCommand.ADD_COMPONENT_ELEMENT_CLASS;

        /**
         * The hash name of the component that the new
         * style rules should be applied to.
         */
        component_name: string;

        /**
         * The element id of the target element. 
         */
        element_index: number;

        /**
         * class names to add to the element.
         */
        class_names: string[];
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

    [EditorCommand.SET_COMPONENT_ELEMENT_ID]: {
        command: EditorCommand.SET_COMPONENT_ELEMENT_ID;
        component_name: string;
        element_index: number;
        id: string;
    };

    [EditorCommand.GET_COMPONENT_SOURCE_RESPONSE]: {
        command: EditorCommand.GET_COMPONENT_SOURCE_RESPONSE;
        component_name: string;
        source: string;
    };
}



type test = {
    [Property in keyof EditorCommand]: Property;
};
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

export interface CSSPatch extends ComponentPatch {

    type: PatchType.CSS;
    style: string;
}

export type Patch = ReplacePatch | TextPatch | StubPatch | CSSPatch;
