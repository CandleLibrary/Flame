

export default class BrowserEngine {
    constructor(ui) {
        this.ui = ui;

        this.px = 0;
        this.py = 0;

        this.pointer = document.createElement("div");
        this.pointer.classList.add("cursor_pointer");

        document.body.appendChild(this.pointer);

        document.body.requestPointerLock();

        // **************** Eventing *****************
        //window.addEventListener("resize", e => this.controls.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("wheel", e => this.handleScroll(e, e.pageX, e.pageY));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            e.stopPropagation();
            e.preventDefault();
            console.log(this.point)

            if(!e.button == 1)
                ui.handlePointerDownEvent(e, this.point, !!0);
        });

        window.addEventListener("pointermove", e => {
            this.pointer.style.left = `${(this.px += e.movementX)}px`
            this.pointer.style.top = `${(this.py += e.movementY)}px`
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
        this.ui.handlePointerMoveEvent({}, this.point)
        requestAnimationFrame(() => this.updatePointer());
    }

    get point() {
        return { x: this.px, y: this.py };
    }
}
