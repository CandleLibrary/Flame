import { actions } from "./actions/action";

const pi2 = Math.PI * 2;

function gripPoint(ctx, x, y, r) {
    ctx.beginPath();
    //ctx.moveTo(x,y); 
    ctx.arc(x, y, r, 0, pi2);
    ctx.fill();
    ctx.stroke();
}

function getTransformed(trs){
if(this.ON_MAIN)
            return {l:this.l, r:this.r, t:this.t, b:this.b};
        else{

            const 
                l = (this.l)*trs.scale+trs.px,
                t = (this.t)*trs.scale+trs.py,
                r = (this.r)*trs.scale+trs.px,
                b = (this.b)*trs.scale+trs.py;

            return {l, r, t, b};
        }
}

export class ControlWidget {
    constructor(controler_component_package) {

        this.element = document.createElement("div");
        this.element.classList.add("widget_component");
        
        if(controler_component_package)
            this.controller = controler_component_package.mount(this.element, this, false, this);
        
        this.IS_ON_MASTER = false;

        document.body.append(this.element);

        this._ml = 0;
        this._mr = 0;
        this._mt = 0;
        this._mb = 0;

        this._pl = 0;
        this._pr = 0;
        this._pt = 0;
        this._pb = 0;

        this.bl = 0;
        this.br = 0;
        this.bt = 0;
        this.bb = 0;

        this.posl = 0;
        this.posr = 0;
        this.post = 0;
        this.posb = 0;

        this.x = 0; //left of border box
        this.y = 0; //top of border box
        this.w = 0; //width of border box
        this.h = 0; //height of border box
        this.br = 0;

        this.target = {
            IS_COMPONENT: false,
            component: null,
            element: null,
            action: null,
            box: { l: 0, r: 0, t: 0, b: 0 }
        };
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
        const IS_ON_MASTER = !!this.IS_ON_MASTER;

        if (IS_COMPONENT) {
            const rect = this.target.element.getBoundingClientRect();
            this.x = rect.left;//component.x;
            this.y = rect.top;//component.y;
            this.w = rect.width;
            this.h = rect.height;
        } else {
            const rect = this.target.element.getBoundingClientRect();
            this.x = rect.left + component.x;
            this.y = rect.top + component.y;
            this.w = rect.width;
            this.h = rect.height;
        }

        const par_prop = component.window.getComputedStyle(this.target.element);

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
    get ml() { return this.x - this._ml - this.posl }
    get mt() { return this.y - this._mt - this.post }
    get mr() { return this.w + this._mr + this._ml + this.ml }
    get mb() { return this.h + this._mb + this._mt + this.mt }

    //Padding box
    get pl() { return this.x + this._pl + this.bl }
    get pt() { return this.y + this._pt + this.bt }
    get pr() { return this.w - this._pr - this._pl - this.br - this.bl + this.pl }
    get pb() { return this.h - this._pb - this._pt - this.bb - this.bt + this.pt }

    //Content box
    get cbl() { return this.x + this.bl }
    get cbt() { return this.y + this.bt }
    get cbr() { return this.w - this.br - this.bl + this.cbl }
    get cbb() { return this.h - this.bb - this.bt + this.cbt }

    render(ctx, scale, transform) {

        const IS_COMPONENT = !!this.target.IS_COMPONENT;

        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        //Border box
        ctx.strokeRect(this.x, this.y, this.w, this.h);

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

        this.element.style.width = `${(cbr-cbl)*scale}px`;
        this.element.style.height = `${(cbb-cbt)*scale}px`;
        this.element.style.left = `${transform.px+(this.x+4)*scale}px`;
        this.element.style.top = `${transform.py+(this.y+4)*scale}px`;


        if (!IS_COMPONENT) {
            ctx.strokeRect(ml, mt, mr - ml, mb - mt);
            ctx.strokeRect(pl, pt, pr - pl, pb - pt);
        }

        ctx.strokeRect(cbl, cbt, cbr - cbl, cbb - cbt);

        //Render Markers

        //Box \ Border Markers 
        ctx.fillStyle = "rgb(0,100,200)";
        ctx.strokeStyle = "rgb(250,250,250)";
        ctx.lineWidth = 1 / scale;
        let r = 4 / scale;

        gripPoint(ctx, cbl, cbt, r);
        gripPoint(ctx, cbr, cbt, r);
        gripPoint(ctx, cbl, cbb, r);
        gripPoint(ctx, cbr, cbb, r);

        if (!IS_COMPONENT) {

            //Margin Markers
            gripPoint(ctx, ml, mt, r);
            gripPoint(ctx, mr, mt, r);
            gripPoint(ctx, ml, mb, r);
            gripPoint(ctx, mr, mb, r);

            //Padding Markers
            gripPoint(ctx, pl, pt, r);
            gripPoint(ctx, pr, pt, r);
            gripPoint(ctx, pl, pb, r);
            gripPoint(ctx, pr, pb, r);
        }
    }


    addView(source){
        source.model = this;
    }

    setTarget(component, element, IS_ON_MASTER = false) {
        this.target.element = element;
        this.target.component = component;
        this.target.IS_COMPONENT = (element) == component.element;
        this.IS_ON_MASTER = IS_ON_MASTER;
    }
}