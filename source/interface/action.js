/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
export function MOVE(system, element, event) {
    debugger
    let dx = event.dx;
    let dy = event.dy;
    // Get CSS information on element and update appropiate records
    let css = system.css.aquireCSS(element);
    css.updatePosition(dx, dy, /*relative*/ true);
}
export const TEXT = {
    onInput(system, element, event) {
        let pos = event.cursor;
        let data = event.text_data;
        let text = system.html.aquireTextData(element);
        text.update(pos, data);
    }
}