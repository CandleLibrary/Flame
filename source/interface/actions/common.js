import wick from "wick";

let types = wick.core.css.types;

export function getFirstPositionedAncestor(ele) {
    let element = null;

    while (ele.parentElement) {
        ele = ele.parentElement;
        let pos = window.getComputedStyle(ele).getPropertyValue("position");

        if (pos && pos !== "sticky" && pos !== "static") {
            element = ele;
            break;
        }
    }

    return element;
}

export function setLeft(element, x, rule) {
    if (rule.props.left == "auto") {
        //convert to numerical form;
        rule.props.left = new types.length(x, "px");
    } else
    if (rule.props.left instanceof types.percentage) {
        //get the nearest positioned ancestor
        let width = 0;
        let ele = getFirstPositionedAncestor(element);
        if (ele)
            width = ele.getBoundingClientRect().width;

        let np = x / width;
        rule.props.left = rule.props.left.copy(np * 100);
    } else {
        rule.props.left = rule.props.left.copy(x);
    }
}

/** Set the left position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setDeltaLeft(element, dx, rule, ratio = 0) {
    if (rule.props.left == "auto") {
        //convert to numerical form;
        rule.props.left = new types.length(0, "px");
    }

    if (rule.props.left instanceof types.percentage) {
        //get the nearest positioned ancestor
        let width = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                width = ele.getBoundingClientRect().width;
        }

        let np = ((width * 0.01 * rule.props.left) + dx) / width;
        rule.props.left = rule.props.left.copy(np * 100);

        ratio = width;
    } else
    if (ratio > 0) {
        dx = dx / ratio;
        rule.props.left = rule.props.left.copy(rule.props.left + dx);
    } else {
        let start_x = element.getBoundingClientRect().x;
        let start_left = rule.props.left;
        rule.props.left = rule.props.left.copy(rule.props.left + dx);
        element.wick_node.setRebuild();
        let rec1 = element.getBoundingClientRect();
        let end_x = rec1.x;
        let diff_x = end_x - start_x;
        if (diff_x !== dx && dx !== 0) {
            ratio = (diff_x / dx);
            let diff = dx / ratio;
            if (diff != 0)
                rule.props.left = start_left.copy(start_left + diff);
        }
    }
    return ratio;
}

/** Set the right position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setRight(element, dx, rule, ratio = 0) {

    if (rule.props.right == "auto") {
        //convert to numerical form;
        rule.props.right = new types.length(0, "px");
    }

    if (rule.props.right instanceof types.percentage) {

        //get the nearest positioned ancestor
        let width = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                width = ele.getBoundingClientRect().width;
        }

        let np = ((width * 0.01 * rule.props.right) + dx) / width;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.right = rule.props.right.copy(np * 100);
            ratio = width;
        }
    } else
    if (ratio > 0) {
        dx = dx / ratio;
        rule.props.right = rule.props.right.copy(rule.props.right - dx);
    } else {
        let start_x = element.getBoundingClientRect().right;
        let start_right = rule.props.right;
        rule.props.right = rule.props.right.copy(rule.props.right - dx);
        element.wick_node.setRebuild();
        let end_x = element.getBoundingClientRect().right;
        let diff_x = end_x - start_x;
        if (diff_x !== dx && dx !== 0) {
            ratio = (diff_x / dx);
            let diff = dx / ratio;
            if (diff != 0)
                rule.props.right = start_right.copy(start_right + diff);
        }
    }

    return ratio;
}

export function setTop(element, x, rule) {
    if (rule.props.top == "auto") {
        //convert to numerical form;
        rule.props.top = new types.length(x, "px");
    } else
    if (rule.props.top instanceof types.percentage) {
        //get the nearest positioned ancestor
        let height = 0;
        
        let ele = getFirstPositionedAncestor(element);

        if (ele) height = ele.getBoundingClientRect().height;

        rule.props.top = rule.props.top.copy(x / height * 100);
    } else {
        rule.props.top = rule.props.top.copy(x);
    }
}

/** Set the top position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setDeltaTop(element, dy, rule, ratio = 0) {
    if (rule.props.top == "auto") {
        //convert to numerical form;
        rule.props.top = new types.length(0, "px");
    }

    if (rule.props.top instanceof types.percentage) {

        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                height = ele.getBoundingClientRect().height;
        }

        let np = ((height * 0.01 * rule.props.top) + dy) / height;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.top = rule.props.top.copy(np * 100);
            ratio = height;
        }

    } else
    if (ratio > 0) {
        dy = dy / ratio;
        rule.props.top = rule.props.top.copy(rule.props.top + dy);
    } else {
        let start_x = element.getBoundingClientRect().top;
        let start_top = rule.props.top;
        rule.props.top = rule.props.top.copy(rule.props.top + dy);
        element.wick_node.setRebuild();
        let end_x = element.getBoundingClientRect().top;
        let diff_x = end_x - start_x;
        if (diff_x !== dy && dy !== 0) {
            ratio = (diff_x / dy);
            let diff = dy / ratio;
            if (diff != 0)
                rule.props.top = start_top.copy(start_top + diff);
        }
    }

    return ratio;
}

/** Set the top position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setBottom(element, dy, rule, ratio = 0) {
    if (rule.props.bottom == "auto") {
        //convert to numerical form;
        rule.props.bottom = new types.length(0, "px");
    }

    if (rule.props.bottom instanceof types.percentage) {

        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                height = ele.getBoundingClientRect().height;
        }

        let np = ((height * 0.01 * rule.props.bottom) + dy) / height;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.bottom = rule.props.bottom.copy(np * 100);
            ratio = height;
        }

    } else
    if (ratio > 0) {
        dy = dy / ratio;
        rule.props.bottom = rule.props.bottom.copy(rule.props.bottom - dy);
    } else {
        let start_x = element.getBoundingClientRect().bottom;
        rule.props.bottom = rule.props.bottom.copy(rule.props.bottom - dy);
        element.wick_node.setRebuild();
        let end_x = element.getBoundingClientRect().bottom;
        let diff_x = end_x - start_x;
        if (diff_x !== dy && dy !== 0) {
            ratio = (diff_x / dy);
            let diff = dy / ratio;
            if (diff != 0)
                rule.props.bottom = start_top.copy(start_top + diff);
        }
    }

    return ratio;
}

/** Set the top position of an Element. Returns calculated ratio if the ratio argument is not defined. */
export function setMarginTop(element, dy, rule, ratio = 0) {
    if (rule.props.margin_top instanceof types.percentage) {

        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele)
                height = ele.getBoundingClientRect().height;
        }

        let np = ((height * 0.01 * rule.props.margin_top) + dy) / height;

        if (Math.abs(np) !== Infinity && !isNaN(np)) {
            rule.props.margin_top = rule.props.margin_top.copy(np * 100);
            ratio = height;
        }

    } else
    if (ratio > 0) {
        dy = dy / ratio;
        rule.props.margin_top = rule.props.margin_top.copy(rule.props.margin_top + dy);
    } else {
        let start_margin_top = rule.props.margin_top;
        rule.props.margin_top = start_margin_top.copy(start_margin_top + dy);
    }

    return ratio;
}




export function setWidth(element, dx, rule, ratio = 0) {
    if (rule.props.width instanceof types.percentage) {
        //get the nearest positioned ancestor
        let width = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele) {
                width = ele.getBoundingClientRect().width;

            }
        }

        let np = ((width * 0.01 * rule.props.width) + dx) / width;
        rule.props.width = rule.props.width.copy(np * 100);

        ratio = width;
    } else {
        let width = rule.props.width;
        let w = element.getBoundingClientRect().width;
        let ow = w / (width / 100);
        let np = ((w - dx * 1) / ow);
        rule.props.width = rule.props.width.copy(np * 100);
    }

    return ratio;
}

export function setHeight(element, dx, rule, ratio = 0) {
    if (rule.props.height instanceof types.percentage) {
        //get the nearest positioned ancestor
        let height = ratio;

        if (ratio == 0) {
            let ele = getFirstPositionedAncestor(element);
            if (ele) {
                height = ele.getBoundingClientRect().height;
                console.log(height);
            }
        }

        let np = ((height * 0.01 * rule.props.height) + dx) / height;
        rule.props.height = rule.props.height.copy(np * 100);

        ratio = height;
    } else {
        let height = rule.props.height;
        let w = element.getBoundingClientRect().height;
        let ow = w / (height / 100);
        let np = ((w + dx * 1) / ow);
        rule.props.height = rule.props.height.copy(np * 100);
    }
}

export function resizeTop(system, element, component, css, dy, cache) {
    let pos = css.props.position;
    if (pos && pos !== "static") {

        if (pos == "relative" && !cache.unique.r.props.margin && !cache.unique.r.props.margin_top) {
            cache.unique.addProp("margin-top:0px");
            cache.destroy();
            cache.generateMovementCache(system, element, component);
            css = cache.rules;
        }

        switch (cache.move_vert_type) {
            case "top bottom":
                cache.valueD = setMarginTop(element, dy, css, cache.valueD);
            case "top":
                cache.valueD = setMarginTop(element, dy, css, cache.valueD);
                setHeight(element, -dy, css, 0);
                break;
            case "bottom":
                setHeight(element, -dy, css, 0);
                break;
        }
    }
}

export function resizeBottom(element, css, dy, cache) {
    switch (cache.move_vert_type) {
        case "top bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
        case "top":
            setHeight(element, dy, css, 0);
            break;
        case "bottom":
            cache.valueC = setBottom(element, -dy, css, cache.valueC);
            setHeight(element, dy, css, 0);
            break;
    }
}

export function resizeLeft(element, css, dx, cache) {
    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setDeltaLeft(element, dx, css, cache.valueB);
            break;
        case "left":
            cache.valueA = setDeltaLeft(element, dx, css, cache.valueA);
            setWidth(element, dx, css, 1);
            break;
        case "right":
            setWidth(element, dx, css, 1);
            break;
    }
}

export function resizeRight(element, css, dx, cache) {
    switch (cache.move_hori_type) {
        case "left right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            break;
        case "left":
            setWidth(element, -dx, css, 1);
            break;
        case "right":
            cache.valueB = setRight(element, -dx, css, cache.valueB);
            setWidth(element, -dx, css, 1);
            break;
    }
}