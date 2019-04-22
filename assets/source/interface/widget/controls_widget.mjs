import { actions } from "../actions/action.mjs";
import ElementBox from "./element_box.mjs";


function getTransformed(trs) {
    if (this.ON_MAIN)
        return { l: this.l, r: this.r, t: this.t, b: this.b };
    else {

        const
            l = (this.l) * trs.scale + trs.px,
            t = (this.t) * trs.scale + trs.py,
            r = (this.r) * trs.scale + trs.px,
            b = (this.b) * trs.scale + trs.py;

        return { l, r, t, b };
    }
}

export class ControlWidget extends ElementBox {
    constructor(controler_component_package, system) {
        super();

        var widget = ControlWidget.cache;

        if (widget) {
            ControlWidget.cache = widget.next;
            widget.next = null;
        } else {

            if (!ControlWidget.system)
                ControlWidget.system = system;

            widget = this;
            this.sources = [];
            this.component_element = document.createElement("div");
            this.component_element.classList.add("widget_component");
            this.component_element.addEventListener("pointer_down", e => {
                this.target.action = actions.MOVE;
                this.ui.setWidgetTarget(this.target);
                this.ui.handlePointerDownEvent({ button: 0 });
            })
        }

        widget.ui = system.ui;


        widget.border_ele = null;
        widget.content_ele = null;
        widget.margin_ele = null;

        if (controler_component_package)
            widget.loadComponent(controler_component_package);

        document.body.append(widget.component_element);

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

    destroy() {
        super.destroy();

        if (this.component_element.parentElement) {
            this.component_element.parentElement.removeChild(this.component_element);
            if (this.sources[0])
                this.sources[0].destroy;
            this.sources = [];
        }

        this.component = null;


        //Caching this object for future use. This should serve as an object pool of ControlWidgets
        this.next = ControlWidget.cache;
        ControlWidget.cache = this;
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

    render(ctx, scale, transform) {
        scale = transform.scale;

        this.scale = transform.scale;

        const IS_COMPONENT = !!this.target.IS_COMPONENT;

        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        this.component_element.style.left = `${transform.px + this.x * scale}px`
        this.component_element.style.top = `${transform.py + this.y * scale}px`;
        this.component_element.style.width = `${(this.w + this.margin_l + this.margin_r + this.border_l + this.border_r + this.padding_l + this.padding_r)*scale}px`;
        this.component_element.style.height = `${(this.h + this.margin_t + this.margin_b + this.border_t + this.border_b + this.padding_t + this.padding_b)*scale}px`;

        this.component_element.style.backgroundColor = "rgba(255,255,0,0.6)"

        if (!IS_COMPONENT)
            this.setExtendedElements(scale);

        //Update Wick Controls
        this.sources[0].update(this);
    }

    setExtendedElements(scale = this.scale) {
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

    loadComponent(pkg) {
        if (pkg) {
            if (this.sources.length > 0) {
                this.sources.forEach(e => e.destroy());
                this.sources.length = 0;
                this.component_element.innerHTML = "";
            }

            this.component_element.innerHTML = "";

            this.controller = pkg.mount(this.component_element, this, false, this);

            let src = this.sources[0]

            this.content_ele = (src.badges.content) ? src.badges.content : null;
            this.margin_ele = (src.badges.margin) ? src.badges.margin : null;
            this.border_order_ele = (src.badges.border) ? src.badges.border : null;
            this.padding_ele = (src.badges.padding) ? src.badges.padding : null;

            this.setExtendedElements();
        }
    }

    async upImport(key, value) {

        switch (key) {
            case "move_action":
                this.ui.setWidgetTarget(this);
                this.ui.handlePointerDownEvent({ button: 0 });
                break;
            case "set_control":
                this.loadComponent(await ControlWidget.loadComponent(value));
                break;
        }
    }

    get actions() {
        return actions;
    }

    addView(source) {
        source.model = this;
    }

    removeView(source) {
        source.model = null;
    }

    setTarget(component, element, IS_ON_MASTER = false) {
        this.element = element;
        this.component = component;
        this.IS_COMPONENT = (element) == component.element;
        this.IS_ON_MASTER = true //IS_ON_MASTER;
        this.setDimensions();
    }
}

ControlWidget.loadComponent = async function(component_path) {
    //component_path = path.resolve(process.cwd(), "./assets/ui_components/controls", component_path)
    const system = ControlWidget.system;
    let doc = system.docs.get(system.docs.loadFile(component_path));
    if (doc) {
        await doc.alert();
        return doc.data;
    }
    return null;
}
ControlWidget.system = null;
ControlWidget.cache = null;
