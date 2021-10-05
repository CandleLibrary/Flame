import { RuntimeComponent } from "@candlelib/wick";

/**
 * User selected edit element. Coordinate in screen space. 
 */
export interface EditorSelection {
    ele: HTMLElement;

    /**
     * Top most element within the frame component.
     */
    frame_ele: HTMLElement;

    comp: RuntimeComponent;


    /**
     * If true, the selection is represent the frame
     * within the root document that houses the component.
     * 
     * This could either be a shadow DOM, or an Iframe.
     */

    IS_COMPONENT_FRAME: boolean;

    /**
     * True if the selection represents a selection locked to a single object.
     */
    ACTIVE: boolean;

    /**
     * True if the selection is actually accessible to the user.
     */
    VALID: boolean;



    /**
     * Position of top edge of the selection box in screen coords.
     */
    top: number;

    /**
     * Position of left edge of the selection box in screen coords.
     */
    left: number;

    /**
     * Width of selection box in screen coords.
     */
    width: number;
    /**
     * Height of selection box in screen coords.
     */
    height: number;
    /**
     * Position of top edge of the selection box in element local coords.
     */
    actual_top: number;

    /**
     * Position of left edge of the selection box in element local coords.
     */
    actual_left: number;

    /**
     * Width of selection box in element in element local coords.
     */
    actual_width: number;
    /**
     * Height of selection box in element in element local coords.
     */
    actual_height: number;

    //transform information
    pz: number;

    rx: number;

    ry: number;

    rz: number;

    sx: number;

    sy: number;

    sz: number;

}