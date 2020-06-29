import { deviant, wick } from "@global";
import { comp, meta } from "@model";
import { updateComponent } from "@api";
import "./component_editor.html";


var source = meta.source,
    mx = 0,
    my = 0,
    posX = 0,
    posY = 0,
    mv = false,
    name = "",
    error = "",
    cm = CodeMirror("#code_area", {value: source, mode: "javascript"});
    
async function updateComp(event) {

    error = "";

    event.stopImmediatePropagation();
    event.stopPropagation();
    event.preventDefault();

    console.log(meta, comp);

    try{

        const 
            value = cm.getValue(),
        
            component = wick(value),

            new_comp = await component.pending;
            
        if(new_comp.name != comp.name){

   
            comp = comp.replace(new_comp);
            
            updateComponent(meta.location, value);
            
            name = new_comp.name;

        }
    }catch(e) {
        error = e;
    }

}


export default <div class="main" component="component_editor">
    
    This is the component editor name:(( name || meta.name )) url:(( meta.location.href ))
   
    <div id="code_area"></div>

    <button type="button" onclick="((updateComp))">UPDATE NOW</button>

    ((error))
    
</div >;