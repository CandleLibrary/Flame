/**
 * Actions provide mechanisms for updating an element, document, and component through user input. 
 */
export function MOVE(system, element, event) {
    let dx = event.dx || 0;
    let dy = event.dy || 0;
    // Get CSS information on element and update appropriate records
    let css = system.css.aquireCSS(element);

    if(css){
        //Check what type of rules are applicable to this operation.
        if(dx !== 0){
            if(css.props.left){
                css.props.left = css.props.left.copy(3);
                console.log(css.props.left)
            }
            
            css.props.background_color.r -= 2;

            let node = element.wick_node;
            node.setRebuild();
            node._linkCSS_();
        }

        element.wick_node.rebuild();

    }else{

    }
}


export function TEXT(system, element, event) {
    let pos = event.cursor;
    let data = event.text_data;
    let text = system.html.aquireTextData(element);
    text.update(pos, data);
}