export default function(env) {

    const ui = env.ui,
        performance = window.performance || Date;

    var old_click_time = performance.now();
    var move_event = null;

    const data = {
        x: 0,
        y: 0,
        dx: 0,
        dy: 0,
        time_since_last_click: 0
    };

    const ele = env.ui.main_view;

// ********************** Miscellaneous ******************************************************************

    ele.addEventListener("resize", e => {
        e.stopPropagation();
        e.preventDefault();
        //data.timeSinceLast = -(old_click_time - (old_click_time = performance.now()));
        ui.input = ui.input.handle("resize", e, env, data);
    });

    // // *********** Mouse *********************
    ele.addEventListener("wheel", e => {
        e.stopPropagation();
        e.preventDefault();
        //data.timeSinceLast = -(old_click_time - (old_click_time = performance.now()));
        ui.input = ui.input.handle("scroll", e, env, data);
    });

// ********************** Pointer ******************************************************************

    ele.addEventListener("pointerdown", e => {

        e.stopPropagation();
        e.preventDefault();

        data.dx = 0;
        data.dy = 0;
        data.x = e.x;
        data.y = e.y;

        data.time_since_last_click = -1;
        old_click_time = performance.now();

        ui.input = ui.input.handle("start", e, env, data);
    });

    ele.addEventListener("pointerup", e => {

        e.stopPropagation();
        e.preventDefault();
        data.dx = 0;
        data.dy = 0;
        data.x = e.x;
        data.y = e.y;

        data.time_since_last_click = -(old_click_time - (old_click_time = performance.now()));

        ui.input = ui.input.handle("end", e, env, data);
    });

    ele.addEventListener("pointermove", e => {
        e.stopPropagation();
        e.preventDefault();
        move_event = e;
        data.dx = e.movementX;
        data.dy = e.movementX;
        data.x += e.movementX;
        data.y += e.movementY;
        old_click_time = -Infinity;
    });

    function updatePointer() {
        requestAnimationFrame(updatePointer);
        if (move_event) {
            ui.input = ui.input.handle("move", move_event, env, data);
            move_event = null;
        }
    }

    requestAnimationFrame(updatePointer);


// ********************** Drag 'n Drop ******************************************************************

    document.body.addEventListener("drop", e => {
        //data.time_since_last_click = -(old_click_time - (old_click_time = performance.now()));
        ui.input = ui.input.handle("drop", e, env, data);
        //ui.handleDocumentDrop(e)
    });

    document.body.addEventListener("dragover", e => {
        e.preventDefault();
        //data.time_since_last_click = -(old_click_time - (old_click_time = performance.now()));
        e.dataTransfer.dropEffect = "copy";
    });


    document.body.addEventListener("dragstart", e => {
        //data.timeSinceLast = -(old_click_time - (old_click_time = performance.now()));
    });

    return {
        get point() {
            return data;
        },

        get x() {
            return data.x;
        },

        get y() {
            return data.y;
        }
    };
}
