import edited_comp from "./edited_component.jsx";
import { components } from "@model:edited-components";

export default <container data="${components}">
    <edited_comp></edited_comp>
</container>;

<style>
    root {
        position:absolute;
        display: block;
        width: 100vh;
        height: 100vw;
    }

    root > * {
        position:absolute;
        border: 1px solid gray;
        background-color: rgb(200,200,200);
        border-radius:5px;
        overflow:hidden;
    }

</style >;