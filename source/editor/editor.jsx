import select_box from "./element_select_box.jsx";
import hover_box from "./element_hover_box.jsx";

<style>
    root{
        position: fixed;
        top: 0;
        left:0;
        z-index:1000;
    }
</style>;

export default <div>
    <hover_box />
    <select_box />
</div>;
