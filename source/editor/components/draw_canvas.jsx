import { draw_objects, sc } from "@model:flame-editor";
import { sys } from "@api";

var canvas = "@#canvas", ctx = canvas.getContext("2d");

function updateDraw() {


    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    ctx.save();

    ctx.fillStyle = "rgba(120,120,200,0.2)";

    sys.ui.transform.setCTX(ctx);

    if (draw_objects.length == 0) return;

    for (const obj of draw_objects) {
        switch (obj.type) {
            case "horizontal_line":
                break;
            case "vertical_line":
                break;
            case "box":
                const { px1, py1, px2, py2, style } = obj,
                    minX = Math.min(px1, px2),
                    maxX = Math.max(px1, px2),
                    minY = Math.min(py1, py2),
                    maxY = Math.max(py1, py2),
                    width = maxX - minX,
                    height = maxY - minY;

                ctx.fillRect(minX, minY, width, height);
                ctx.strokeRect(minX, minY, width, height);
                break;
            case "path":
                break;
        }
    }

    ctx.restore();
}

watch(updateDraw, sc);

export default <canvas id="canvas"></canvas>;

<style>
    root {
        position:absolute;
        top:0;
        left:0;
        width:100vw;
        height:100vh;
    }
</style>;
