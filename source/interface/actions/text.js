import wick from "wick";
export function TEXTEDITOR(system, element, component, x, y){
	const ui_group = document.querySelector("#ui_group");
	//Open text editor component in UI view

	let textfield = document.createElement("textarea");
	textfield.style.position = "absolute";
	textfield.style.top = "100px";
	textfield.style.left = "100px";
	textfield.style.zIndex = 7;

	ui_group.appendChild(textfield);

	textfield.value = element.wick_node + "";

	let node = element.wick_node;

	textfield.addEventListener("change", (e)=>{
		node.reparse(e.target.value).then(n=>{ node = n});
	});
}



export function TEXT(system, element, component, dx, dy) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}