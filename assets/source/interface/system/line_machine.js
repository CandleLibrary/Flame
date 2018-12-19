class LineBox {
    get l() {
        return this.rect.x + this.component.x + 4;
    }

    get t() {
        return this.rect.y + this.component.y + 4;
    }

    get b() {
        return this.rect.y + this.rect.height + this.component.y + 4;
    }

    get r() {
        return this.rect.x + this.rect.width + this.component.x + 4;
    }
}

class ElementLineBox extends LineBox {
    constructor(element, component) {
        super();
        this.rect = element.getBoundingClientRect();
        this.component = component;
    }
}

class ComponentLineBox extends LineBox {
    constructor(component) {
    	super();
        this.component = component;
    }

    get l() {
        return this.component.x;
    }

    get t() {
        return this.component.y;
    }

    get b() {
        return this.component.height + this.component.y;
    }

    get r() {
        return this.component.width + this.component.x;
    }
}



function CreateBoxes(ele, c, LineMachine, target) {

    LineMachine.boxes.push(new ElementLineBox(ele, c));

    let children = ele.children;
    for (let i = 0; i < children.length; i++) {
        if (target == children[i]) continue;
        CreateBoxes(children[i], c, LineMachine, target);
    }
}

function CreateComponentBoxes(c, LineMachine, target) {
    if (c == target) return;
    LineMachine.boxes.push(new ComponentLineBox(c));
}

export class LineMachine {
    constructor() {
        this.boxes = [];
        this.tolerance = 10;

        this.activex = { id: -1, ot: 0, tt: 0 };
        this.activey = { id: -1, ot: 0, tt: 0 };
    }

    setPotentialBoxes(element, component, components) {
        this.boxes.length = 0;

        if (!element) {
            components.forEach(c => CreateComponentBoxes(c, this, component));
        } else {
            //get tree from component and create boxes from all elements inside the component. 
            let tree = component.window.document.body;

            let ele = tree;

            CreateBoxes(ele, component, this, element);
        }

    }

    getSuggestedLine(box, dx, dy) {

        if (!box) return { dx, dy };

        let mx = this.tolerance;
        let my = this.tolerance;
        let x_set = false;
        let y_set = false;
        const l = box.l;
        const r = box.r;

        const LO = (l - r == 0);

        const t = box.t;
        const b = box.b;
        const ch = (l + r) / 2;
        const cv = (t + b) / 2;
        const tol = this.tolerance;


        for (let i = 0; i < this.boxes.length; i++) {
            let box = this.boxes[i];

            //Make sure the ranges overlap

            //Vertical
            if (!x_set && l <= (box.r + tol + 1) && r >= (box.l - tol - 1)) {
                //There is overlap; find the best alignment
                let c = (box.l + box.r) * 0.5;
                let tol = Math.abs(mx);
                let array = [
                    //left
                    l - box.l, l - box.r, l - c,
                    //right
                    r - box.l, r - box.r, r - c,
                    //center
                    ch - box.l, ch - box.r, ch - c
                ];

                let length = LO ? 3 : 9;

                for (let j = 0; j < length; j++)
                    if (Math.abs(array[j]) < tol) {
                        mx = array[j];
                        this.activex.id = i;
                        this.activex.tt = (j % 3);
                        this.activex.ot = (j / 3) | 0;
                        //x_set = true;
                        //break;
                    }
            }

            //Horizontal
            if (!y_set && t < (box.b + tol + 1) && b > (box.t - tol - 1)) {
                //There is overlap; find the best alignment
                let c = (box.t + box.b) * 0.5;
                let tol = Math.abs(my);
                let array = [
                    /*top*/
                    t - box.t, t - box.b, t - c,
                    /*bottom*/
                    b - box.t, b - box.b, b - c,
                    /*center*/
                    cv - box.t, cv - box.b, cv - c
                ];
                for (let j = 0; j < 9; j++)
                    if (Math.abs(array[j]) < tol) {
                        my = array[j];
                        this.activey.id = i;
                        this.activey.tt = (j % 3);
                        this.activey.ot = (j / 3) | 0;
                        //y_set = true;
                        break;
                    }
            }

            if (x_set && y_set) break;
        }

        if (Math.abs(mx) < tol && Math.abs(dx) < tol)
            dx = mx;
        else
            this.activex.id = -1;

        if (Math.abs(my) < tol && Math.abs(dy) < tol)
            dy = my;
        else
            this.activey.id = -1;

        return { dx, dy };
    }

    render(ctx, transform, boxc) {

        if (!boxc || this.boxes.length == 0) return;

        ctx.save();
        transform.setCTX(ctx);

        if (this.activex.id > -1) {
            //0 = l, 1 = r, 2 = c 
            ctx.strokeStyle = "red";
            let box = this.boxes[this.activex.id];
            let x = [box.l, box.r, (box.r + box.l) / 2][this.activex.tt];
            let y1 = [box.t, box.t, (box.t + box.b) / 2][this.activex.tt];
            let y2 = [boxc.t, boxc.t, (boxc.t + boxc.b) / 2][this.activex.ot];
            ctx.beginPath();
            ctx.moveTo(x, y1);
            ctx.lineTo(x, y2);
            ctx.stroke();
        }

        if (this.activey.id > -1) {
            //0 = t, 1 = b, 2 = c 
            ctx.strokeStyle = "green";
            let box = this.boxes[this.activey.id];
            let y = [box.t, box.b, (box.t + box.b) / 2][this.activey.tt];
            let x1 = [box.l, box.l, (box.r + box.l) / 2][this.activey.tt];
            let x2 = [boxc.l, boxc.l, (boxc.r + boxc.l) / 2][this.activey.ot];
            ctx.beginPath();
            ctx.moveTo(x1, y);
            ctx.lineTo(x2, y);
            ctx.stroke();
        }

        ctx.restore();
    }
}