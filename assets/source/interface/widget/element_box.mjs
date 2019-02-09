/***
	This module is responsible for measuring an element and making that data available to other modules.
***/

function getOffsetPos(element) {
    const a = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
        const b = getOffsetPos(element.offsetParent);
        a.x += b.x;
        a.y += b.y;
    }
    return a;
}

export default class ElementBox {
    constructor() {
        //Caching the global transform object for reuse.
        this.element = null;

        this.margin_l = 0;
        this.margin_r = 0;
        this.margin_t = 0;
        this.margin_b = 0;

        this.padding_l = 0;
        this.padding_r = 0;
        this.padding_t = 0;
        this.padding_b = 0;

        this.border_l = 0;
        this.border_r = 0;
        this.border_t = 0;
        this.border_b = 0;

        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
    }

    destroy() {
        this.element = null;
    }

    setDimensions(element = this.element) {

        this.element = element;

        const par_prop = window.getComputedStyle(this.element);
        const rect = getOffsetPos(this.element);

        this.x = rect.x;
        this.y = rect.y;

        this.w = parseFloat(par_prop.width);
        this.h = parseFloat(par_prop.height);

        //margin
        this.margin_l = parseFloat(par_prop.marginLeft) || 0;
        this.margin_r = parseFloat(par_prop.marginRight) || 0;
        this.margin_t = parseFloat(par_prop.marginTop) || 0;
        this.margin_b = parseFloat(par_prop.marginBottom) || 0;

        //border
        this.border_l = parseFloat(par_prop.borderLeftWidth) || 0;
        this.border_r = parseFloat(par_prop.borderRightWidth) || 0;
        this.border_t = parseFloat(par_prop.borderTopWidth) || 0;
        this.border_b = parseFloat(par_prop.borderBottomWidth) || 0;

        //padding
        this.padding_l = parseFloat(par_prop.paddingLeft) || 0;
        this.padding_r = parseFloat(par_prop.paddingRight) || 0;
        this.padding_t = parseFloat(par_prop.paddingTop) || 0;
        this.padding_b = parseFloat(par_prop.paddingBottom) || 0;

        this.posl = parseFloat(par_prop.left) || 0;
        this.posr = parseFloat(par_prop.right) || 0;
        this.post = parseFloat(par_prop.top) || 0;
        this.posb = parseFloat(par_prop.bottom) || 0;
    }

    get MarginX() {
        return this.x;
    }

    get MarginY() {
        return this.y;
    }

    get BorderX() {
        return (this.x + this.margin_l);
    }

    get BorderY() {
        return (this.y + this.margin_t);
    }

    get PaddingX() {
        return (this.x + this.margin_l + this.border_l);
    }

    get PaddingY() {
        return (this.y + this.margin_t + this.border_t);
    }

    get ContentX() {
        return (this.x + this.margin_l + this.border_l + this.padding_l);
    }

    get ContentY() {
        return (this.y + this.margin_t + this.border_t + this.padding_t);
    }

    get MarginWidth() {
        return (this.margin_l + this.border_l + this.padding_l + this.w + this.padding_r + this.border_r + this.margin_r);
    }

    get MarginHeight() {
        return (this.margin_t + this.border_t + this.padding_t + this.h + this.padding_b + this.border_b + this.margin_b);
    }

    get BorderWidth() {
        return (this.border_l + this.padding_l + this.w + this.padding_r + this.border_r);
    }

    get BorderHeight() {
        return (this.border_t + this.padding_t + this.h + this.padding_b + this.border_b);
    }

    get PaddingWidth() {
        return (this.padding_l + this.w + this.padding_r);
    }

    get PaddingHeight() {
        return (this.padding_t + this.h + this.padding_b);
    }

    get ContentWidth() {
        return (this.w);
    }

    get ContentHeight() {
        return (this.height);
    }

    get Margin_H() {
        return {
            l: this.MarginX,
            r: this.MarginX + this.MarginWidth
        }
    }

    get Margin_V() {
        return {
            t: this.MarginY,
            b: this.MarginY + this.MarginHeight
        }
    }

    get MarginBox() {
        const v = this.Margin_V;
        const h = this.Margin_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        }
    }

    get Padding_H() {
        return {
            l: this.PaddingX,
            r: this.PaddingX + this.PaddingWidth
        }
    }

    get Padding_V() {
        return {
            t: this.PaddingY,
            b: this.PaddingY + this.PaddingHeight
        }
    }

    get PaddingBox() {
        const v = this.Padding_V;
        const h = this.Padding_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        }
    }

    get Border_H() {
        return {
            l: this.BorderX,
            r: this.BorderX + this.BorderWidth
        }
    }

    get Border_V() {
        return {
            t: this.BorderY,
            b: this.BorderY + this.BorderHeight
        }
    }

    get BorderBox() {
        const v = this.Border_V;
        const h = this.Border_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        }
    }

    get Content_H() {
        return {
            l: this.ContentX,
            r: this.ContentX + this.ContentWidth
        }
    }

    get Content_V() {
        return {
            t: this.ContentY,
            b: this.ContentY + this.ContentHeight
        }
    }

    get ContentBox() {
        const v = this.Content_V;
        const h = this.Content_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        }
    }

    getBox(box_type = ElementBox.types.margin, edge_type = ElementBox.types.edge.all, transform = null) {
        let box = null;

        switch (box_type) {
            case 0://ElementBox.types.margin:
                box = this.MarginBox;
                break;
            case 1://ElementBox.types.border:
                box = this.BorderBox;
                break;
            case 2://ElementBox.types.padding:
                box = this.PaddingBox;
                break;
            case 3://ElementBox.types.content:
                box = this.ContentBox;
                break;
        }

        if ((edge_type & 15)) {

            if ((edge_type & 1)/*ElementBox.types.edge.left*/)
                box.r = box.l;
            else if ((edge_type & 2)/*ElementBox.types.edge.right*/)
                box.l = box.r;

            if ((edge_type & 4)/*ElementBox.types.edge.top*/)
                box.b = box.t;
            else if ((edge_type & 8)/*ElementBox.types.edge.bottom*/)
                box.t = box.b;
        }

        if (transform) {
            const px = transform.px,
                py = transform.py,
                s = transform.scale;

            box.l = transform.px + box.l * s;
            box.t = transform.py + box.t * s;
            box.r = transform.px + box.r * s;
            box.b = transform.py + box.b * s;
        }

        return box;
    }
}


ElementBox.types = Object.freeze({
    margin: 0,
    border: 1,
    padding: 2,
    content: 3,
    edge: Object.freeze({
        all: 0,
        left: 1,
        right: 2,
        top: 4,
        bottom: 8,
    })
})
