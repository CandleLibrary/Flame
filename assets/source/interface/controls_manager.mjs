import { actions } from "./actions/action";

const pi2 = Math.PI * 2;

function gripPoint(ctx, x, y, r) {
    ctx.beginPath();
    //ctx.moveTo(x,y); 
    ctx.arc(x, y, r, 0, pi2);
    ctx.fill();
    ctx.stroke();
}

class BoxElement {
    constructor() {
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
        this.IS_COMPONENT = false;

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

    setDimensions(IS_COMPONENT = this.IS_COMPONENT) {
        let component = this.target.component;

        if (IS_COMPONENT) {
            this.IS_COMPONENT = true;
            this.x = component.x + 4;
            this.y = component.y + 4;
            this.w = component.width;
            this.h = component.height;
        } else {
            let rect = this.target.element.getBoundingClientRect();
            this.x = rect.left + component.x + 4;
            this.y = rect.top + component.y + 4;
            this.w = rect.width;
            this.h = rect.height;
        }

        let par_prop = component.window.getComputedStyle(this.target.element);

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
    get ml() { return this.x - this._ml - this.posl; }
    get mt() { return this.y - this._mt - this.post; }
    get mr() { return this.w + this._mr + this._ml + this.ml; }
    get mb() { return this.h + this._mb + this._mt + this.mt; }

    //Padding box
    get pl() { return this.x + this._pl + this.bl; }
    get pt() { return this.y + this._pt + this.bt; }
    get pr() { return this.w - this._pr - this._pl - this.br - this.bl + this.pl; }
    get pb() { return this.h - this._pb - this._pt - this.bb - this.bt + this.pt; }

    //Content box
    get cbl() { return this.x + this.bl; }
    get cbt() { return this.y + this.bt; }
    get cbr() { return this.w - this.br - this.bl + this.cbl; }
    get cbb() { return this.h - this.bb - this.bt + this.cbt; }

    render(ctx, scale) {
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


        if (!this.IS_COMPONENT) {
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

        if (!this.IS_COMPONENT) {

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

    setTarget(component, element, IS_COMPONENT) {
        this.target.element = element;
        this.target.component = component;
        this.target.IS_COMPONENT = IS_COMPONENT;
    }
}

export class CanvasManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    setIframeTarget(component, element, IS_COMPONENT = false) {
        let box = new BoxElement(element);
        box.setTarget(component, element, IS_COMPONENT);
        box.setDimensions(IS_COMPONENT);
        this.widget = box;
    }

    render(transform) {
        this.element.width = this.element.width;
        if (this.widget) {
            this.ctx.save();
            transform.setCTX(this.ctx);
            this.widget.render(this.ctx, transform.scale);
            this.ctx.restore();
        }
    }

    pointerDown(e, x, y, transform) {
        let widget = this.widget;
        if (widget) {

            widget.target.action = null;

            let tr = 5 / transform.scale; //touch radius

            //Margin box
            let ml = widget.ml; // widget.x - widget.ml - widget.posl;
            let mt = widget.mt; // widget.y - widget.mt - widget.post;
            let mr = widget.mr; // widget.w + widget.mr + widget.ml + ml;
            let mb = widget.mb; // widget.h + widget.mb + widget.mt + mt;

            //Padding box
            let pl = widget.pl; // widget.x + widget.pl + widget.bl;
            let pt = widget.pt; // widget.y + widget.pt + widget.bt;
            let pr = widget.pr; // widget.w - widget.pr - widget.pl - widget.br - widget.bl + pl;
            let pb = widget.pb; // widget.h - widget.pb - widget.pt - widget.bb - widget.bt + pt;

            //Content box
            let cbl = widget.cbl; // widget.x + widget.bl;
            let cbt = widget.cbt; // widget.y + widget.bt;
            let cbr = widget.cbr; // widget.w - widget.br - widget.bl + cbl;
            let cbb = widget.cbb; // widget.h - widget.bb - widget.bt + cbt;
            //Widget size
            while (true) {

                //Content box first / Can double as border
                if (x >= cbl - tr && x <= cbr + tr) {
                    if (y >= cbt - tr && y <= cbb + tr) {
                        if (x <= cbl + tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETL;
                                break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBL;
                                break;
                            }
                        } else if (x >= cbr - tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETR;
                                break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBR;
                                break;
                            }
                        } else {
                            widget.target.action = actions.MOVE;
                        }
                    }
                }

                //Margin box
                if (x >= ml - tr && x <= mr + tr) {
                    if (y >= mt - tr && y <= mb + tr) {
                        if (x <= ml + tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTL;
                                break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBL;
                                break;
                            }
                        } else if (x >= mr - tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTR;
                                break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBR;
                                break;
                            }
                        }
                    }
                }

                //Padding box
                if (x >= pl - tr && x <= pr + tr) {
                    if (y >= pt - tr && y <= pb + tr) {
                        if (x <= pl + tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTL;
                                break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBL;
                                break;
                            }
                        } else if (x >= pr - tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTR;
                                break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBR;
                                break;
                            }
                        }
                    }
                }
                break;
            }
            if (widget.target.action) {

                widget.setBox();
                return widget.target;
            }
            /*
                        if (dx > 0 && dx < w)
                            if (dy > 0 && dy < h) {
                                //Check corners for action;
                                this.widget.target.action = actions.MOVE;

                                if (dx <= ws) {
                                    if (dy <= ws)
                                        this.widget.target.action = actions.SCALETL;
                                    else if (dy >= h - ws)
                                        this.widget.target.action = actions.SCALEBL;
                                }

                                if (dx >= w - ws) {
                                    if (dy <= ws)
                                        this.widget.target.action = actions.SCALETR;
                                    else if (dy >= h - ws)
                                        this.widget.target.action = actions.SCALEBR;
                                }

                                return this.widget.target;
                            }
                            */
        }
        return false;
    }

    resize(transform) {
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.render(transform);
    }

    clearTargets(transform) {
        this.widget = null;
        this.render(transform);
    }
}
