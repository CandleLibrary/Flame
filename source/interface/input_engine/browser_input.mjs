export default class BrowserEngine {
    constructor(env) {

        this.x = 0;
        this.y = 0;

        this.pointer = document.createElement("div");
        this.pointer.classList.add("cursor_pointer");

        document.body.appendChild(this.pointer);

        //document.body.requestPointerLock();

        // **************** Eventing *****************
        //window.addEventListener("resize", e => this.controls.resize(this.transform));

        // // *********** Mouse *********************
        window.addEventListener("wheel", e => env.ui.input.handleScroll(e, e.pageX, e.pageY));

        // // *********** Pointer *********************
        window.addEventListener("pointerdown", e => {
            this.x = e.pageX;
            this.y = e.pageY;

            //e.stopPropagation();
            //e.preventDefault();

            env.ui.input.handlePointerDownEvent(e, this, !!0);
        });

        window.addEventListener("pointermove", e => {
            this.x = e.pageX;
            this.y = e.pageY;

            env.ui.input.handlePointerMoveEvent({}, this)
        });

        window.addEventListener("pointerup", e => env.ui.input.handlePointerEndEvent(e));

        // // *********** Drag 'n Drop *********************
        document.body.addEventListener("drop", e => env.ui.input.handleDocumentDrop(e));
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
