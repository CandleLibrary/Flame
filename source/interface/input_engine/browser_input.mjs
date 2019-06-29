export default function(env, ui_element, view_element) {
    
    const ui = env.ui;
    var px = 0;
    var py = 0;
    const ele = env.ui.main_view;

    var pointer = document.createElement("div");
    pointer.classList.add("cursor_pointer");

    var move_event = null;

    //document.body.appendChild(pointer);
    //document.body.requestPointerLock();

    // **************** Eventing *****************
    ele.addEventListener("resize", e => {
        //this.controls.resize(this.transform)
        ui.input = ui.input.handle("resize", e, env, {x:px, y:py});
    });

    // // *********** Mouse *********************
    ele.addEventListener("wheel", e => {
        //this.handleScroll(e, e.pageX, e.pageY)
        ui.input = ui.input.handle("scroll", e, env, {x:px, y:py});
    });

    // // *********** Pointer *********************
    ele.addEventListener("pointerdown", e => {

        e.stopPropagation();
        e.preventDefault();

        px =  e.x;
        py =  e.y;

        //if (!e.button == 1)
        ui.input = ui.input.handle("start", e, env, {x:px, y:py});
        //ui.handlePointerDownEvent(e, {x:px, y:py}, !!0);

    });

    ele.addEventListener("pointerup", e => {
        ui.input = ui.input.handle("end", e, env, {x:px, y:py});
    });

    ele.addEventListener("pointermove", e => {
        move_event = e;
        px += e.movementX;
        py += e.movementY;
    });


    // // *********** Drag 'n Drop *********************
    document.body.addEventListener("drop", e => {
        ui.input = ui.input.handle("drop", e, env, {x:px, y:py});
        //ui.handleDocumentDrop(e)
    });

    document.body.addEventListener("dragover", e => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "copy";
    });


    document.body.addEventListener("dragstart", e => {});


    function updatePointer() {
        requestAnimationFrame(updatePointer);
        if(move_event){
            ui.input = ui.input.handle("move", move_event, env, {x:px, y:py});
            move_event = null;
        }
    }

    requestAnimationFrame(updatePointer);

    return {
        get point() {
            return {x:px, y:py};
        },

        get x(){
            return px;
        },

        get y(){
            return py;
        }
    };
}
