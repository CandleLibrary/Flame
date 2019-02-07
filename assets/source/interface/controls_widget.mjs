import { actions } from "./actions/action";
import path from "path";

const pi2 = Math.PI * 2;
let default_component = "";

function gripPoint(ctx, x, y, r) {
    ctx.beginPath();
    ctx.arc(x, y, r, 0, pi2);
    ctx.fill();
    ctx.stroke();
}

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


export class ControlWidget {
    constructor(controler_component_package, system) {
        var widget = ControlWidget.cache;

        if (widget) {

            ControlWidget.cache = widget.next;
            widget.next = null;

            let element = widget.element;

        } else {

            if (!ControlWidget.system)
                ControlWidget.system = system;

            widget = this;
            this.sources = [];
            this.element = document.createElement("div");
            this.element.classList.add("widget_component");
            //this.element.setAttribute("tabindex", -1);
            this.element.addEventListener("pointer_down", e => {
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

        document.body.append(widget.element);

        widget.target = {
            IS_COMPONENT: false,
            component: null,
            element: null,
            action: null,
            box: { l: 0, r: 0, t: 0, b: 0 }
        };


        widget.IS_ON_MASTER = false;

        widget._ml = 0;
        widget._mr = 0;
        widget._mt = 0;
        widget._mb = 0;

        widget._pl = 0;
        widget._pr = 0;
        widget._pt = 0;
        widget._pb = 0;

        widget.bl = 0;
        widget.br = 0;
        widget.bt = 0;
        widget.bb = 0;

        widget.posl = 0;
        widget.posr = 0;
        widget.post = 0;
        widget.posb = 0;

        widget.x = 0; //left of border box
        widget.y = 0; //top of border box
        widget.w = 0; //width of border box
        widget.h = 0; //height of border box
        widget.br = 0;


        return widget;
    }

    destroy() {
        if (this.element.parentElement) {
            this.element.parentElement.removeChild(this.element);
            if (this.sources[0])
                this.sources[0].destroy;
            this.sources = [];
        }

        this.next = ControlWidget.cache;
        ControlWidget.cache = this;
    }

    setBox() {

        const box = (this.target.box) ? this.target.box : { l: 0, r: 0, t: 0, b: 0 };
        this.target.box = box;
        this.target.box.ON_MAIN = this.IS_ON_MASTER;
        this.target.box.getTransformed = getTransformed;
        switch (this.target.action) {
            case actions.MOVE:
                box.l = this.cbl;
                box.r = this.cbr;
                box.b = this.cbb;
                box.t = this.cbt;
                break;
            case actions.RESIZETL:
                box.l = this.cbl;
                box.r = this.cbl;
                box.b = this.cbt;
                box.t = this.cbt;
                break;
            case actions.RESIZEBL:
                box.l = this.cbl;
                box.r = this.cbl;
                box.b = this.cbb;
                box.t = this.cbb;
                break;
            case actions.RESIZETR:
                box.l = this.cbr;
                box.r = this.cbr;
                box.b = this.cbt;
                box.t = this.cbt;
                break;
            case actions.RESIZEBR:
                box.l = this.cbr;
                box.r = this.cbr;
                box.b = this.cbb;
                box.t = this.cbb;
                break;
            case actions.RESIZEMARGINTL:
                box.l = this.ml;
                box.r = this.ml;
                box.b = this.mt;
                box.t = this.mt;
                break;
            case actions.RESIZEMARGINBL:
                box.l = this.ml;
                box.r = this.ml;
                box.b = this.mb;
                box.t = this.mb;
                break;
            case actions.RESIZEMARGINTR:
                box.l = this.mr;
                box.r = this.mr;
                box.b = this.mt;
                box.t = this.mt;
                break;
            case actions.RESIZEMARGINBR:
                box.l = this.mr;
                box.r = this.mr;
                box.b = this.mb;
                box.t = this.mb;
                break;
            case actions.RESIZEPADDINGTL:
                break;
            case actions.RESIZEPADDINGBL:
                break;
            case actions.RESIZEPADDINGTR:
                break;
            case actions.RESIZEPADDINGBR:
                break;
        }
    }

    setDimensions() {
        const component = this.target.component;
        const IS_COMPONENT = !!this.target.IS_COMPONENT;
        const IS_ON_MASTER = true //!!this.IS_ON_MASTER;
        const par_prop = component.window.getComputedStyle(this.target.element);

        if (IS_COMPONENT) {
            const rect = this.target.element.getBoundingClientRect();
            this.x = rect.left; //component.x;
            this.y = rect.top; //component.y;
            this.w = parseFloat(par_prop.getPropertyValue("width"));
            this.h = parseFloat(par_prop.getPropertyValue("height"));
        } else {
            const rect = this.target.element.getBoundingClientRect();
            this.x = rect.left;
            this.y = rect.top;
            this.w = parseFloat(par_prop.getPropertyValue("width"));
            this.h = parseFloat(par_prop.getPropertyValue("height"));
        }


        //margin
        this._ml = parseFloat(par_prop.getPropertyValue("margin-left"));
        this._mr = parseFloat(par_prop.getPropertyValue("margin-right"));
        this._mt = parseFloat(par_prop.getPropertyValue("margin-top"));
        this._mb = parseFloat(par_prop.getPropertyValue("margin-bottom"));

        //border
        this.bl = parseFloat(par_prop.getPropertyValue("border-left"));
        this.br = parseFloat(par_prop.getPropertyValue("border-right"));
        this.bt = parseFloat(par_prop.getPropertyValue("border-top"));
        this.bb = parseFloat(par_prop.getPropertyValue("border-bottom"));

        //padding
        this._pl = parseFloat(par_prop.getPropertyValue("padding-left"));
        this._pr = parseFloat(par_prop.getPropertyValue("padding-right"));
        this._pt = parseFloat(par_prop.getPropertyValue("padding-top"));
        this._pb = parseFloat(par_prop.getPropertyValue("padding-bottom"));

        this.posl = parseFloat(par_prop.getPropertyValue("left"));
        this.posr = parseFloat(par_prop.getPropertyValue("right"));
        this.post = parseFloat(par_prop.getPropertyValue("top"));
        this.posb = parseFloat(par_prop.getPropertyValue("bottom"));

        this.setBox();
    }

    //Margin box
    get ml() { return this.x }
    get mt() { return this.y }
    get mr() { return this.w + this._mr + this._ml + this.ml + this._pl + this._pr }
    get mb() { return this.h + this._mb + this._mt + this.mt + this._pl + this._pr }

    //Padding box
    get pl() { return this._pl + this.bl }
    get pt() { return this._pt + this.bt }
    get pr() { return this.w - this._pr - this._pl - this.br - this.bl + this.pl }
    get pb() { return this.h - this._pb - this._pt - this.bb - this.bt + this.pt }

    //Content box
    get cbl() { return this.x + this.bl }
    get cbt() { return this.y + this.bt }
    get cbr() { return this.w - this.br - this.bl + this.cbl }
    get cbb() { return this.h - this.bb - this.bt + this.cbt }

    render(ctx, scale, transform) {
        scale = transform.scale;

        this.scale = transform.scale;

        const IS_COMPONENT = !!this.target.IS_COMPONENT;

        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        //Border box
        //ctx.strokeRect(this.x, this.y, this.w, this.h);

        //Margin box
        let ml = this.ml;
        let mt = this.mt;
        let mr = this.mr;
        let mb = this.mb;

        //Padding box
        let pl = this.pl;
        let pt = this.pt;
        let pr = this.pr;
        let pb = this.pb;

        //Content box
        let cbl = this.cbl;
        let cbt = this.cbt;
        let cbr = this.cbr;
        let cbb = this.cbb;

        this.element.style.width = `${(this.w + this._ml + this._mr + this.bl + this.br + this._pl + this._pr)*scale}px`;
        this.element.style.height = `${(this.h + this._mt + this._mb + this.bt + this.bb + this._pt + this._pb)*scale}px`;
        this.element.style.backgroundColor = "rgba(255,255,0,0.6)"

        if (IS_COMPONENT) {
            this.element.style.left = `${this.x}px`
            this.element.style.top = `${this.y}px`;
        } else {
            this.element.style.left = `${(this.x)}px`
            this.element.style.top = `${(this.y)}px`;
            ctx.strokeRect(ml, mt, mr - ml, mb - mt);
            ctx.strokeRect(pl, pt, pr - pl, pb - pt);

            this.setExtendedElements(scale);
        }

        //ctx.strokeRect(cbl, cbt, cbr - cbl, cbb - cbt);

        //Render Markers

        //Box \ Border Markers 
        //ctx.fillStyle = "rgb(0,100,200)";
        //ctx.strokeStyle = "rgb(250,250,250)";
        //ctx.lineWidth = 1 / scale;
        //let r = 4 / scale;

        //Update Wick Controls
        this.sources[0].update(this);
    }

    setExtendedElements(scale = this.scale) {
        if (this.border_ele) {
            this.border_ele.style.left = `${(this._ml)*scale}px`;
            this.border_ele.style.top = `${(this._mt)*scale}px`;
            this.border_ele.style.width = `${(this.w + this.bl + this.br + this._pl + this._pr)*scale}px`;
            this.border_ele.style.height = `${(this.h + this.bt + this.bb + this._pt + this._pb)*scale}px`;
        }

        if (this.padding_ele) {
            this.padding_ele.style.left = `${(this._ml + this.bl)*scale}px`;
            this.padding_ele.style.top = `${(this._mt + this.bt)*scale}px`;
            this.padding_ele.style.width = `${(this.w + this._pl + this._pr)*scale}px`;
            this.padding_ele.style.height = `${(this.h + this._pt + this._pb)*scale}px`;
        }

        if (this.content_ele) {
            this.content_ele.style.left = `${(this._ml + this.bl + this._pl)*scale}px`;
            this.content_ele.style.top = `${(this._mt + this.bt + this._pt)*scale}px`;
            this.content_ele.style.width = `${(this.w)*scale}px`;
            this.content_ele.style.height = `${(this.h)*scale}px`;
        }
    }

    loadComponent(pkg) {
        if (pkg) {
            if (this.sources.length > 0) {
                this.sources.forEach(e => e.destroy());
                this.sources.length = 0;
                this.element.innerHTML = "";
            }

            this.element.innerHTML = "";

            this.controller = pkg.mount(this.element, this, false, this);

            let src = this.sources[0]

            this.content_ele = (src.badges.content) ? src.badges.content : null;
            this.margin_ele = (src.badges.margin) ? src.badges.margin : null;
            this.border_ele = (src.badges.border) ? src.badges.border : null;
            this.padding_ele = (src.badges.padding) ? src.badges.padding : null;

            this.setExtendedElements();
        }
    }

    async upImport(key, value) {
        console.log(key, value)
        switch (key) {
            case "move_action":
                console.log(key, this.target)
                this.ui.setWidgetTarget(this.target);
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
        this.target.element = element;
        this.target.component = component;
        this.target.IS_COMPONENT = (element) == component.element;
        this.IS_ON_MASTER = true //IS_ON_MASTER;
    }
}

ControlWidget.loadComponent = async function(component_path) {
    component_path = path.resolve(process.cwd(), "./assets/ui_components/controls", component_path)
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
