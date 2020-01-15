export async function UPDATE_ELEMENT_OUTERHTML (system, component, element, outer_html){
	//TODO - Collect old html data and store as history
	if(await element.wick_node.reparse(outer_html))
		system.ui.update();
}