export default class BrowserEngine {
    constructor(ui) {
        this.ui = ui;

        this.x = 0;
        this.y = 0;

        this.pointer = document.createElement("div");
        this.pointer.classList.add("cursor_pointer");

        document.body.appendChild(this.pointer);

        //document.body.requestPointerLock();

        // **************** Eventing *****************
        //window.addEventListener("resize", e => this.controls.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("wheel", e => ui.handleScroll(e, e.pageX, e.pageY));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            this.x = e.pageX;
            this.y = e.pageY;

            //e.stopPropagation();
            //e.preventDefault();

            ui.handlePointerDownEvent(e, this, !!0);
        });

        window.addEventListener("pointermove", e => {
            this.x = e.pageX;
            this.y = e.pageY;

            ui.handlePointerMoveEvent({}, this)
        });

        window.addEventListener("pointerup", e => ui.handlePointerEndEvent(e));

        // // *********** Drag 'n Drop *********************
        document.body.addEventListener("drop", e => ui.handleDocumentDrop(e));
        document.body.addEventListener("dragover", e => {
            e.preventDefault();
            e.dataTransfer.dropEffect = "copy";
        });

        requestAnimationFrame(() => this.updatePointer());

        document.body.addEventListener("dragstart", e => {});
    }

    destroy(){

    }

    updatePointer() {
        //requestAnimationFrame(() => this.updatePointer());
    }

    get point() {
        return { x: this.x, y: this.y };
    }
}
