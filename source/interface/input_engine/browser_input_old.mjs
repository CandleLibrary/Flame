
const mouse= require("./cpp/build/Release/addon");
export default class BrowserEngine {
    constructor(ui) {
        
        this.ui = ui;

        this.x = 0;
        this.y = 0;

       this.setEvents();
       setInterval(()=>{
            let pos = mouse.mouse_pos();
            let x = (pos >> 16) &  0xFFFF;
            let y = (pos) &  0xFFFF;
            this.x = x;
            this.y = y;
            ui.handlePointerMoveEvent({}, this);
       },5);
    }

    setEvents(){
        const ui = this.ui;
         // **************** Eventing *****************
        //window.addEventListener("resize", e => this.controls.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("wheel", e => ui.handleScroll(e, e.pageX, e.pageY));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            this.x = e.x;
            this.y = e.y;
            e.stopPropagation();
            e.preventDefault();
            ui.handlePointerDownEvent(e, this, !!0);
        });

        window.addEventListener("pointermove", e => {
            //this.x = e.x;
            //this.y = e.y;
            //ui.handlePointerMoveEvent({}, this)
        });

        window.addEventListener("pointerup", e => ui.handlePointerEndEvent(e));

        // // *********** Drag 'n Drop *********************
        document.body.addEventListener("drop", e => ui.handleDocumentDrop(e));
        document.body.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });
        document.body.addEventListener("dragstart", e => {});

        requestAnimationFrame(() => this.updatePointer());

    }

    destroy(){

    }

    updatePointer() {
        requestAnimationFrame(() => this.updatePointer());
    }

    get point() {
        return this;
    }
}
