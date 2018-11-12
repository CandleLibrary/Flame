class LineBox {
    constructor(element, component) {
        this.rect = element.getBoundingClientRect();
        this.component = component;
    }

    get left() {
        return this.rect.x + this.component.x + 4;
    }

    get top() {
        return this.rect.y + this.component.y + 4;
    }

    get bottom() {
        return this.rect.y + this.rect.height + this.component.x + 4;
    }

    get right() {
        return this.rect.x + this.rect.width + this.component.y + 4;
    }
}

function CreateBoxes(ele, c, LineMachine, target) {

    LineMachine.boxes.push(new LineBox(ele, c));

    let children = ele.children;
    for (let i = 0; i < children.length; i++){
    	if(target == children[i]) continue;
        CreateBoxes(children[i], c, LineMachine, target);
    }
}

export class LineMachine {
    constructor() {
        this.boxes = [];
        this.tolerance = 15;

        this.activex = {id:-1, l:false};
        this.activey = {id:-1, t:false};
    }

    setPotentialBoxes(element, component, components) {
        //get tree from component and create boxes from all elements inside the component. 
        this.boxes.length = 0;
        let tree = component.window.document.body;

        let ele = tree;

        CreateBoxes(ele, component, this, element);

    }

    getSuggestedLine(box, dx, dy) {
        let mx = Infinity;
        let my = Infinity;
        let id = 0;

        let l = box.left;
        let r = box.right;
        let t = box.top;
        let b = box.bottom;

        for (let i = 0; i < this.boxes.length; i++) {
            let box = this.boxes[i];

            //Vertical
            if (Math.abs(l - box.left) < Math.abs(mx)) {
                mx = l - box.left;
                this.activex.id = i;
                this.activex.l = true;
            }

            if (Math.abs(l - box.right) < Math.abs(mx)) {
                mx = l - box.right;
                this.activex.id = i;
                this.activex.l = false;
            }

            //right
            if (Math.abs(r - box.left) < Math.abs(mx)) {
                mx = r - box.left;
                this.activex.id = i;
                this.activex.l = true;
            }

            if (Math.abs(r - box.right) < Math.abs(mx)) {
                mx = r - box.left;
                this.activex.id = i;
                this.activex.l = false;
            }

            //horizontal

            if (Math.abs(t - box.top) < Math.abs(my)) {
                my = t - box.top;
                this.activey.id = i;
                this.activey.t = true;
            }

            if (Math.abs(t - box.bottom) < Math.abs(my)) {
                my = t - box.bottom;
                this.activey.id = i;
                this.activey.t = false;
            }

            //bottom
            if (Math.abs(b - box.top) < Math.abs(my)) {
                my = b - box.top;
                this.activey.id = i;
                this.activey.t = true;
            }

            if (Math.abs(b - box.bottom) < Math.abs(my)) {
                my = b - box.top;
                this.activey.id = i;
                this.activey.t = false;
            }
        }

        if (Math.abs(mx) < this.tolerance && Math.abs(dx) < this.tolerance) {
            dx = mx;
        }else{
        	this.activex.id = -1;
        }

        if (Math.abs(my) < this.tolerance && Math.abs(dy) < this.tolerance) {
            dy = my;
        }else{
        	this.activey.id = -1;
        }

        return { dx, dy };
    }

    render(ctx, transform) {
    	ctx.save();
    	transform.setCTX(ctx);

    	if(this.activex.id > -1){
    		ctx.strokeStyle="red";
    		let box = this.boxes[this.activex.id];
    		let x = this.activex.l ? box.left : box.right;
    		ctx.beginPath();
    		ctx.moveTo(x, box.top);
    		ctx.lineTo(x, box.top+1000);
    		ctx.stroke();
    	}

    	if(this.activey.id > -1){
    		ctx.strokeStyle="green";
    		let box = this.boxes[this.activey.id];
    		let y = this.activey.t ? box.top : box.bottom;
    		ctx.beginPath();
    		ctx.moveTo(box.left,y);
    		ctx.lineTo(box.left+1000,y);
    		ctx.stroke();
    	}


    	ctx.restore();
    }
}