import wick from "wick";
export function TEXTEDITOR(system, element, component, x, y){}



export function TEXT(system, element, component, dx, dy) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}