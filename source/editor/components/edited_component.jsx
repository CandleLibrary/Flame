import { comp } from "@model";
import { sys } from "@api";

const frame = "@iframe";

frame.onload = (
    () => {
        const c =
            new (sys.edit_wick.rt.gC(comp))
                (undefined,
                    undefined,
                    undefined,
                    undefined,
                    undefined,
                    Object.assign({}, sys.edit_wick.rt.presets, { window: frame.contentWindow, css_cache: [] })
                );


        c.appendToDOM(frame.contentDocument.body);

        frame.contentDocument.body.style.overflow = "hidden";
    });

export default <iframe></iframe>;

<style>
    root{
        position:absolute;
        width:100vw;
        height:100vh;
        overflow:hidden
    }
</style>;