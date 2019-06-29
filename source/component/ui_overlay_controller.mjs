//import wick from "@candlefw/wick";
import ElementBox from "../interface/widget/element_box.mjs";
import { actions } from "../interface/actions/action.mjs";
import ui_controller from "./ui_controller.mjs";

function getOffsetPos(element) {
    const a = { x: element.offsetLeft, y: element.offsetTop };
    if (element.offsetParent) {
        const b = getOffsetPos(element.offsetParent);
        a.x += b.x;
        a.y += b.y;
    }
    return a;
}

export default class ui_overlay_controller extends ui_controller {
    constructor(env, pathname) {

        super(env, pathname);
this.frame.classList.add("overlay");

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

        this.actions = actions;

        var widget = ui_overlay_controller.cache;

        if (widget) {
            ui_overlay_controller.cache = widget.next;
            widget.next = null;
        } else {

            if (!ui_overlay_controller.env)
                ui_overlay_controller.env = env;

            widget = this;
        }

        widget.ui = env.ui.manager;


        widget.border_ele = null;
        widget.content_ele = null;
        widget.margin_ele = null;
        widget.target = {
            IS_COMPONENT: false,
            component: null,
            element: null,
            action: null,
            box: { l: 0, r: 0, t: 0, b: 0 }
        };


        widget.IS_ON_MASTER = false;

        widget.posl = 0;
        widget.posr = 0;
        widget.post = 0;
        widget.posb = 0;

        widget.boxType = 0;
        widget.edgeType = 0;

        widget.x = 0; //left of border box
        widget.y = 0; //top of border box
        widget.w = 0; //width of border box
        widget.h = 0; //height of border box

        widget.next = null;

        widget.action = null;

        return widget;
    }

    loadAcknowledged() {

    }

    set(data) {
        this.mgr.update({
            target: data
        });
    }

    mount(element, active) {

        this.element = active.element;
        this.component = active.component;
        this.IS_COMPONENT = (active.element) == active.component.frame;
        this.IS_ON_MASTER = true;

        if (this.frame.parentNode != element)
            element.appendChild(this.frame);

        this.render(this.env.ui.interface.transform);
    }

    unmount() {}

    documentReady(ast) {

        if (ast) {
            this.scope = ast.mount(this.frame);
            this.scope.load(this);
            this.scope.parent = this;

            this.setExtendedElements();
        }
    }

    async upImport(key, value) {

        switch (key) {
            case "move_action":
                this.env.ui.input.handle("start", { button: 0 }, this.env, {action:this.action});
                break;
            case "set_control":
                //this.loadComponent(await ControlWidget.loadComponent(value));
                break;
        }
    }

    get type() {
        return "overlay";
    }

    //Margin box
    get ml() { return this.MarginX }
    get mt() { return this.MarginY }
    get mr() { return this.MarginX + this.MarginWidth }
    get mb() { return this.MarginY + this.MarginHeight }

    //Padding box
    get pl() { return this.PaddingX }
    get pt() { return this.PaddingY }
    get pr() { return this.PaddingX + this.PaddingWidth }
    get pb() { return this.PaddingY + this.PaddingHeight }

    //Border box
    get bl() { return this.BorderX }
    get bt() { return this.BorderY }
    get br() { return this.BorderX + this.BorderWidth }
    get bb() { return this.BorderY + this.BorderHeight }

    //Content box
    get cl() { return this.ContentX }
    get ct() { return this.ContentY }
    get cr() { return this.ContentX + this.ContentWidth }
    get cb() { return this.ContentY + this.ContentHeight }

    render(transform) {
        const scale = transform.scale;

        this.scale = transform.scale;

        const IS_COMPONENT = !!this.target.IS_COMPONENT;

        this.setDimensions();

        //ctx.strokeStyle = "rgb(0,0,0)";
        //ctx.lineWidth = (1 / scale) * 0.95;

        this.frame.style.left = `${transform.px + this.x * scale}px`;
        this.frame.style.top = `${transform.py + this.y * scale}px`;
        this.frame.style.width = `${(this.w + this.margin_l + this.margin_r + this.border_l + this.border_r + this.padding_l + this.padding_r)*scale}px`;
        this.frame.style.height = `${(this.h + this.margin_t + this.margin_b + this.border_t + this.border_b + this.padding_t + this.padding_b)*scale}px`;

        //this.scope.ele.style.left = `${transform.px + this.x * scale}px`;
        //this.scope.ele.style.top = `${transform.py + this.y * scale}px`;
        //this.scope.ele.style.width = `${(this.w + this.margin_l + this.margin_r + this.border_l + this.border_r + this.padding_l + this.padding_r)*scale}px`;
        //this.scope.ele.style.height = `${(this.h + this.margin_t + this.margin_b + this.border_t + this.border_b + this.padding_t + this.padding_b)*scale}px`;

        //this.frame.style.backgroundColor = "rgba(255,255,0,0.6)";

        if (!IS_COMPONENT)
            this.setExtendedElements(scale);

        //Update Wick Controls
        this.scope.update(this);
    }

    setExtendedElements(scale = this.scale) {
        return
        if (this.border_order_ele) {
            this.border_order_ele.style.left = `${(this.margin_l)*scale}px`;
            this.border_order_ele.style.top = `${(this.margin_t)*scale}px`;
            this.border_order_ele.style.width = `${(this.w + this.border_l + this.border_r + this.padding_l + this.padding_r)*scale}px`;
            this.border_order_ele.style.height = `${(this.h + this.border_t + this.border_b + this.padding_t + this.padding_b)*scale}px`;
        }

        if (this.padding_ele) {
            this.padding_ele.style.left = `${(this.margin_l + this.border_l)*scale}px`;
            this.padding_ele.style.top = `${(this.margin_t + this.border_t)*scale}px`;
            this.padding_ele.style.width = `${(this.w + this.padding_l + this.padding_r)*scale}px`;
            this.padding_ele.style.height = `${(this.h + this.padding_t + this.padding_b)*scale}px`;
        }

        if (this.content_ele) {
            this.content_ele.style.left = `${(this.margin_l + this.border_l + this.padding_l)*scale}px`;
            this.content_ele.style.top = `${(this.margin_t + this.border_t + this.padding_t)*scale}px`;
            this.content_ele.style.width = `${(this.w)*scale}px`;
            this.content_ele.style.height = `${(this.h)*scale}px`;
        }
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
        };
    }

    get Margin_V() {
        return {
            t: this.MarginY,
            b: this.MarginY + this.MarginHeight
        };
    }

    get MarginBox() {
        const v = this.Margin_V;
        const h = this.Margin_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        };
    }

    get Padding_H() {
        return {
            l: this.PaddingX,
            r: this.PaddingX + this.PaddingWidth
        };
    }

    get Padding_V() {
        return {
            t: this.PaddingY,
            b: this.PaddingY + this.PaddingHeight
        };
    }

    get PaddingBox() {
        const v = this.Padding_V;
        const h = this.Padding_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        };
    }

    get Border_H() {
        return {
            l: this.BorderX,
            r: this.BorderX + this.BorderWidth
        };
    }

    get Border_V() {
        return {
            t: this.BorderY,
            b: this.BorderY + this.BorderHeight
        };
    }

    get BorderBox() {
        const v = this.Border_V;
        const h = this.Border_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        };
    }

    get Content_H() {
        return {
            l: this.ContentX,
            r: this.ContentX + this.ContentWidth
        };
    }

    get Content_V() {
        return {
            t: this.ContentY,
            b: this.ContentY + this.ContentHeight
        };
    }

    get ContentBox() {
        const v = this.Content_V;
        const h = this.Content_H;
        return {
            l: h.l,
            r: h.r,
            t: v.t,
            b: v.b
        };
    }

    getBox(box_type = ElementBox.types.margin, edge_type = ElementBox.types.edge.all, transform = null) {
        let box = null;

        switch (box_type) {
            case 0: //ElementBox.types.margin:
                box = this.MarginBox;
                break;
            case 1: //ElementBox.types.border:
                box = this.BorderBox;
                break;
            case 2: //ElementBox.types.padding:
                box = this.PaddingBox;
                break;
            case 3: //ElementBox.types.content:
                box = this.ContentBox;
                break;
        }

        if ((edge_type & 15)) {

            if ((edge_type & 1) /*ElementBox.types.edge.left*/ )
                box.r = box.l;
            else if ((edge_type & 2) /*ElementBox.types.edge.right*/ )
                box.l = box.r;

            if ((edge_type & 4) /*ElementBox.types.edge.top*/ )
                box.b = box.t;
            else if ((edge_type & 8) /*ElementBox.types.edge.bottom*/ )
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

    update(){
        this.render(this.env.ui.interface.transform);
    }

    get types() {
        return ElementBox.types;
    }

}

ui_overlay_controller.env = null;
ui_overlay_controller.cache = null;
