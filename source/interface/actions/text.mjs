
export function TEXTEDITOR(system, component, element, x, y){}

export function TEXT(system, component, element, dx, dy) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}
