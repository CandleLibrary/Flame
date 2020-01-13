//import wick from "@candlefw/wick";
import ElementBox from "../interface/widget/element_box.mjs";
import * as actions from "../interface/actions/action.mjs";
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

export default class ui_hover_controller extends ui_controller {
    constructor(env, pathname) {

        super(env, pathname);
        
        this.frame.classList.add("overlay");

        this.frame.style.pointerEvents = "none";
        this.frame.setAttribute("tabindex", "-1");

        this.element = null;
        this.actions = actions;

        var widget = ui_hover_controller.cache;

        if (widget) {
            ui_hover_controller.cache = widget.next;
            widget.next = null;
        } else {

            if (!ui_hover_controller.env)
                ui_hover_controller.env = env;

            widget = this;
        }

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

       // this.update(this.env);
    }

    

    unmount(){
        if(this.frame.parentNode)
            this.frame.parentNode.removeChild(this.frame);
    }

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
        return "hover";
    }

    update(env, widget) {
        const scale = env.ui.interface.transform.scale;
        
        this.scale = scale;

        //const widget = env.ui.interface.widget;

        this.x = widget.real_pos_x;
        this.y = widget.real_pos_y;
        this.width = (widget.w + widget.margin_l + widget.margin_r + widget.border_l + widget.border_r + widget.padding_l + widget.padding_r)*scale;
        this.height = (widget.h + widget.margin_t + widget.margin_b + widget.border_t + widget.border_b + widget.padding_t + widget.padding_b)*scale;

        if (!widget.IS_COMPONENT)
            this.setExtendedElements(widget,scale);

        //Update Wick Controls
        this.scope.update(widget);
    }

    setExtendedElements(widget, scale = this.scale) {

        if (this.border_order_ele) {
            this.border_order_ele.style.left = `${(widget.margin_l)*scale}px`;
            this.border_order_ele.style.top = `${(widget.margin_t)*scale}px`;
            this.border_order_ele.style.width = `${(widget.w + widget.border_l + widget.border_r + widget.padding_l + widget.padding_r)*scale}px`;
            this.border_order_ele.style.height = `${(widget.h + widget.border_t + widget.border_b + widget.padding_t + widget.padding_b)*scale}px`;
        }

        if (this.padding_ele) {
            this.padding_ele.style.left = `${(widget.margin_l + widget.border_l)*scale}px`;
            this.padding_ele.style.top = `${(widget.margin_t + widget.border_t)*scale}px`;
            this.padding_ele.style.width = `${(widget.w + widget.padding_l + widget.padding_r)*scale}px`;
            this.padding_ele.style.height = `${(widget.h + widget.padding_t + widget.padding_b)*scale}px`;
        }

        if (this.content_ele) {
            this.content_ele.style.left = `${(widget.margin_l + widget.border_l + widget.padding_l)*scale}px`;
            this.content_ele.style.top = `${(widget.margin_t + widget.border_t + widget.padding_t)*scale}px`;
            this.content_ele.style.width = `${(widget.w)*scale}px`;
            this.content_ele.style.height = `${(widget.h)*scale}px`;
        }
    }

    get widget(){
        return this.env.ui.interface.widget;
    }
    
    get types() {
        return ElementBox.types;
    }

}

ui_hover_controller.env = null;
ui_hover_controller.cache = null;
