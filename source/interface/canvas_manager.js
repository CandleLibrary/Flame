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
        this.ml = 0;
        this.mr = 0;
        this.mt = 0;
        this.mb = 0;

        this.padl = 0;
        this.padr = 0;
        this.padt = 0;
        this.padb = 0;

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
    }

    setDimensions(IS_COMPONENT = this.IS_COMPONENT) {

        if (IS_COMPONENT) {
            this.IS_COMPONENT = true;
            this.x = this.target.component.x + 4;
            this.y = this.target.component.y + 4;
            this.w = this.target.component.width;
            this.h = this.target.component.height;
        } else {
            let component = this.target.component;
            let rect = this.target.element.getBoundingClientRect();
            let par_prop = component.window.getComputedStyle(this.target.element);

            //margin
            this.ml = parseFloat(par_prop.getPropertyValue("margin-left"));
            this.mr = parseFloat(par_prop.getPropertyValue("margin-right"));
            this.mt = parseFloat(par_prop.getPropertyValue("margin-top"));
            this.mb = parseFloat(par_prop.getPropertyValue("margin-bottom"));

            //border
            this.bl = parseFloat(par_prop.getPropertyValue("border-left"));
            this.br = parseFloat(par_prop.getPropertyValue("border-right"));
            this.bt = parseFloat(par_prop.getPropertyValue("border-top"));
            this.bb = parseFloat(par_prop.getPropertyValue("border-bottom"));

            //padding
            this.pl = parseFloat(par_prop.getPropertyValue("padding-left"));
            this.pr = parseFloat(par_prop.getPropertyValue("padding-right"));
            this.pt = parseFloat(par_prop.getPropertyValue("padding-top"));
            this.pb = parseFloat(par_prop.getPropertyValue("padding-bottom"));

            this.posl = parseFloat(par_prop.getPropertyValue("left"));
            this.posr = parseFloat(par_prop.getPropertyValue("right"));
            this.post = parseFloat(par_prop.getPropertyValue("top"));
            this.posb = parseFloat(par_prop.getPropertyValue("bottom"));

            this.x = rect.left + component.x + 4;
            this.y = rect.top + component.y + 4;
            this.w = rect.width;
            this.h = rect.height;
        }
    }

    render(ctx, scale) {
        this.setDimensions();

        ctx.strokeStyle = "rgb(0,0,0)";
        ctx.lineWidth = (1 / scale) * 0.95;

        //Border box
        ctx.strokeRect(this.x, this.y, this.w, this.h);

        //Margin box
        let ml = this.x - this.ml - this.posl;
        let mt = this.y - this.mt - this.post;
        let mr = this.w + this.mr + this.ml + ml;
        let mb = this.h + this.mb + this.mt + mt;

        //Padding box
        let pl = this.x + this.pl + this.bl;
        let pt = this.y + this.pt + this.bt;
        let pr = this.w - this.pr - this.pl - this.br - this.bl + pl;
        let pb = this.h - this.pb - this.pt - this.bb - this.bt + pt;

        //Content box
        let cbl = this.x + this.bl;
        let cbt = this.y + this.bt;
        let cbr = this.w - this.br - this.bl + cbl;
        let cbb = this.h - this.bb - this.bt + cbt;


        ctx.strokeRect(ml, mt, mr - ml, mb - mt);
        ctx.strokeRect(pl, pt, pr - pl, pb - pt);
        ctx.strokeRect(cbl, cbt, cbr - cbl, cbb - cbt);

        //Render Markers

        //Box \ Border Markers 
        ctx.fillStyle = "rgb(0,100,200)";
        ctx.strokeStyle = "rgb(250,250,250)";
        ctx.lineWidth = 2;
        let r = 5;

        gripPoint(ctx, cbl, cbt, r);
        gripPoint(ctx, cbr, cbt, r);
        gripPoint(ctx, cbl, cbb, r);
        gripPoint(ctx, cbr, cbb, r);

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

export class CanvasManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    setIframeTarget(element, component, IS_COMPONENT = false) {
        let box = new BoxElement(element);
        box.target = { element, component, IS_COMPONENT };
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
        let widget = this.widget
        if (widget) {

            widget.target.action = null;

            let tr = 5; //touch radius

            //Margin box
            let ml = widget.x - widget.ml - widget.posl;
            let mt = widget.y - widget.mt - widget.post;
            let mr = widget.w + widget.mr + widget.ml + ml;
            let mb = widget.h + widget.mb + widget.mt + mt;

            //Padding box
            let pl = widget.x + widget.pl + widget.bl;
            let pt = widget.y + widget.pt + widget.bt;
            let pr = widget.w - widget.pr - widget.pl - widget.br - widget.bl + pl;
            let pb = widget.h - widget.pb - widget.pt - widget.bb - widget.bt + pt;

            //Content box
            let cbl = widget.x + widget.bl;
            let cbt = widget.y + widget.bt;
            let cbr = widget.w - widget.br - widget.bl + cbl;
            let cbb = widget.h - widget.bb - widget.bt + cbt;
            //Widget size
            while (true) {

                //Content box first / Can double as border
                if (x >= cbl - tr && x <= cbr + tr) {
                    if (y >= cbt - tr && y <= cbb + tr) {
                        if (x <= cbl + tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETL; break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBL; break;
                            }
                        } else if (x >= cbr - tr) {
                            if (y <= cbt + tr) {
                                this.widget.target.action = actions.RESIZETR; break;
                            } else if (y >= cbb - tr) {
                                this.widget.target.action = actions.RESIZEBR; break;
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
                                this.widget.target.action = actions.RESIZEMARGINTL; break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBL; break;
                            }
                        } else if (x >= mr - tr) {
                            if (y <= mt + tr) {
                                this.widget.target.action = actions.RESIZEMARGINTR; break;
                            } else if (y >= mb - tr) {
                                this.widget.target.action = actions.RESIZEMARGINBR; break;
                            }
                        }
                    }
                }

                //Padding box
                if (x >= pl - tr && x <= pr + tr) {
                    if (y >= pt - tr && y <= pb + tr) {
                        if (x <= pl + tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTL; break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBL; break;
                            }
                        } else if (x >= pr - tr) {
                            if (y <= pt + tr) {
                                this.widget.target.action = actions.RESIZEPADDINGTR; break;
                            } else if (y >= pb - tr) {
                                this.widget.target.action = actions.RESIZEPADDINGBR; break;
                            }
                        }
                    }
                }
                break;
            }
            if (widget.target.action)
                return widget.target;
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