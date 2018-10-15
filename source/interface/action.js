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
        //Position relative with top or bottom and left or right.
        //Position absolute with top or bottom  and left or right.
        //Position relative with margin
        //Position 
        if(dx !== 0){
            if(css.props.left)
                css.props.left = css.props.left.copy(css.props.left + dx);
            
            if(css.props.top)
                css.props.top = css.props.top.copy(css.props.top + dy);
           

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

export function RESIZE(system, element, event){

}

export function BACKGROUND(system, element, event){

}

export function FONT(system, element, event){

}

export function MARGIN(system, element, event){

}

export function PADDING(system, element, event){

}

export function TRANSFORM(system, element, event){

}

export function SVG(system, element, event){

}
