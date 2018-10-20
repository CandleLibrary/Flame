import {
    MOVE,
    SCALETL,
    SCALEBL,
    SCALETR,
    SCALEBR
} from "./action";

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
        this.x = 0;
        this.y = 0;
        this.w = 0;
        this.h = 0;
        this.br = 0;
    }

    setDimensions() {
    	let rect = this.target.element.getBoundingClientRect();
        this.x = rect.left + this.target.component.x + 4;
        this.y = rect.top + this.target.component.y + 4;
        this.w = rect.width;
        this.h = rect.height;
    }

    render(ctx) {
    	this.setDimensions();
        ctx.strokeStyle = "rgb(0,150,250)";
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x - 1, this.y - 1, this.w + 2, this.h + 2);

        //Render Markers
        ctx.fillStyle = "rgb(0,100,200)";
        ctx.strokeStyle = "rgb(250,250,250)";
        ctx.lineWidth = 2;
        let r = 5;
        gripPoint(ctx, this.x, this.y, r);
        gripPoint(ctx, this.x + this.w, this.y, r);
        gripPoint(ctx, this.x, this.y + this.h, r);
        gripPoint(ctx, this.x + this.w, this.y + this.h, r);
    }
}

export class CanvasManager {
    constructor() {
        //Canvas setup.
        this.element = document.createElement("canvas");
        this.element.classList.add("flame_ui_canvas");
        this.ctx = this.element.getContext("2d");
    }

    setIframeTarget(element, component) {
        let rect = element.getBoundingClientRect();

        let box = new BoxElement(element);
        box.target = { element, component };
        box.rect = rect;
        box.setDimensions();
        this.widget = box;
    }

    render(transform) {
        this.element.width = this.element.width;
        if (this.widget) {
            this.ctx.save();
            transform.setCTX(this.ctx);
            this.widget.render(this.ctx);
            this.ctx.restore();
        }
    }

    pointerDown(e, x, y, transform) {
        if (this.widget) {
            let w = this.widget.w + 20;
            let h = this.widget.h + 20;
            let dx = x - (this.widget.x - 10); 
            let dy = y - (this.widget.y - 10); 

            //Widget size
            let ws = 20;

            if (dx > 0 && dx < w)
                if (dy > 0 && dy < h) {
                    //Check corners for action;
                    this.widget.target.action = MOVE;

                    if(dx <= ws){
                        if(dy <= ws)
                            this.widget.target.action = SCALETL;
                        else if (dy >= h - ws)
                            this.widget.target.action = SCALEBL;
                    }

                    if(dx >= w - ws){
                        if(dy <= ws)
                            this.widget.target.action = SCALETR;
                        else if (dy >= h - ws)
                            this.widget.target.action = SCALEBR;
                    }
                    
                    return this.widget.target;
                }
        }
        return false;
    }

    resize(transform){
        this.element.width = window.innerWidth;
        this.element.height = window.innerHeight;
        this.render(transform);
    }

    clearTargets(transform){
        this.widget = null;
        this.render(transform);
    }
}