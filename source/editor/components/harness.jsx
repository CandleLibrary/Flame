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
        width:100vw;
        height:100vh;
        overflow:hidden;
        padding:2px;
        border-radius: 2px;
        border: 1px solid #c0c0c0;
        background-color: white;
    }

</style >;