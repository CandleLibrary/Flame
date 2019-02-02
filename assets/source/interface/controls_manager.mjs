import { actions } from "./actions/action";
import { ControlWidget } from "./controls_widget.mjs";

export class ControlsManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    addTarget(component, element, IS_COMPONENT, IS_ON_MASTER){

    }

    removeTarget(component, element){

    }
   

    setTarget(component, element, IS_COMPONENT = false, IS_ON_MASTER = false, ui) {

        if(this.widget)
            this.widget.destroy();
        
        const box = new ControlWidget(ui.active_handler.package);
        box.IS_ON_MASTER = IS_ON_MASTER;

    //setTarget(component, element, IS_COMPONENT = false, IS_ON_MASTER = false) {
    //    const box = new ControlWidget(element);
    //    box.IS_ON_MASTER = true//IS_ON_MASTER;
//>>> shadow_dom
        box.setTarget(component, element, IS_COMPONENT);
        box.setDimensions(IS_COMPONENT);
        this.widget = box;
    }
    
    clearTargets(transform) {
        this.widget = null;
        this.render(transform);
    }

    render(transform) {
        this.element.width = this.element.width;

        if (this.widget) {
            let scale = 1;
            
            this.ctx.save();

            if (!this.widget.IS_ON_MASTER) {
                transform.setCTX(this.ctx);
                scale = transform.scale;
            }

            this.widget.render(this.ctx, scale, transform);

            this.ctx.restore();
        }
    }

    pointerDown(e, x, y, transform, IS_ON_MASTER = false) {
        const widget = this.widget;
        
        if (widget) {

            widget.target.action = null;

            let tr = 5 / transform.scale; //(false) ? 1 : transform.scale; //touch radius

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
}
