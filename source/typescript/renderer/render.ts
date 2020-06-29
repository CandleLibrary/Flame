import wick, { Component, Presets, DOMLiteral, componentDataToClassString, buildComponentStyleSheet } from "@candlefw/wick";
import url from "@candlefw/url";
/**
 * Render provides the mechanism to turn wick components 
 * into source files for client use. The output can either
 * be a single HTML "slug" that contains markup, CSS, and JS
 * data, or it can be split into discrete files separating out
 * the data types into their own products. 
 * 
 * Input can a be single wick component that serves as the root of the file,
 * or it can be URL to wick component source file. A template can be defined 
 * that describes the form of the compiled wick pages. 
 */
function isWickComponent(obj) {
    console.error("Replace with logic to test the object argument");
    return true;
}

export enum SourceType {
    SPLIT,
    COMBINED
}

export interface RenderOptions {

    source_type: SourceType;
    js_page_template?: string;
    html_page_template?: string;
    css_page_template?: string;
    USE_RADIATE_RUNTIME?: boolean;
    USE_FLAME_RUNTIME?: boolean;
}

const FILE = {
    header: "",
    body_html: "",
    templates: "",
    scripts: "",
};

const
    addHeader = (file, header_data) => Object.assign({}, file, { header: file.header + "\n" + header_data }),
    addBody = (file, body_data) => Object.assign({}, file, { body_html: file.body_html + "\n" + body_data }),
    addTemplate = (file, template_data) => Object.assign({}, file, { templates: file.templates + "\n" + template_data }),
    addScript = (file, script_data) => Object.assign({}, file, { scripts: file.scripts + "\n" + script_data }),
    createComponentScript = (file, components, fn) => {
        const str = components.map(fn).join("\n\t");
        return addScript(file, `
<script id="wick-components">{
    const w = wick.default;
    ${str}}
</script>`);
    },
    createComponentStyle = (file, components, fn) => {
        const str = components.map(fn).join("\n");
        return addHeader(file, `<style id="wick-css">${str}\n</style>`);
    };
export const renderPage = async (source: String | Component, wick, options: RenderOptions): Promise<{ html?: string, js?: string, css?: string; }> => {

    await wick.server();

    const {
        source_type = SourceType.COMBINED,
        USE_RADIATE_RUNTIME = false,
        USE_FLAME_RUNTIME = false,
        js_page_template = "",
        html_page_template = "",
        css_page_template = ""
    } = options;

    let component: Component = null, presets = await wick.setPresets();


    if (typeof (source) == "string") {
        component = await wick(source, presets).pending;
    } else if (isWickComponent(source))
        component = source;


    if (!component) throw new Error("source is not a wick component!");

    let file = Object.assign({}, FILE);

    const components = getComponentGroup(component, presets);

    if (USE_RADIATE_RUNTIME) {
        file = addHeader(file, `<script src="/flame/router/radiate"></script>`);
        file = addScript(file, `<script>{const w = wick.default; cfw.radiate("${component.name}");}</script>`);
    }

    if (!USE_FLAME_RUNTIME) {

        file = addHeader(file, `<script src="/cfw/wickrt"></script>`);
        file = addHeader(file, `<script src="/cfw/glow"></script>`);

        file = addScript(file, `<script> const w = wick.default; w.setPresets({}); </script>`);


        file = createComponentScript(file, components, comp => {
            const comp_class_string = componentDataToClassString(comp, presets, false, false);
            return `w.rt.registerComponent("${comp.name}",((c, p, rt)=>${comp_class_string})({}, w.rt.presets, w.rt));`;
        });

        file = createComponentStyle(file, components, buildComponentStyleSheet);

    } else {

        file = addHeader(file, `<script src="/cfw/wick"></script>`);
        file = addHeader(file, `<script src="/cfw/glow"></script>`);

        file = addHeader(file, `<script src="/cm/codemirror.js"></script>`);
        file = addHeader(file, `<link href="/cm/codemirror.css" rel="stylesheet"/>`);

        file = addScript(file, `        
<script>
    {
        const w = wick.default; 
        
        w.setPresets({
            api: {
                async getHistory(url) {
                    //Send data back to the server to handle the update of the file
                },

                async updateComponent(url, string) {
                    //Send data back to the server to handle the update of the file
                    const update_url = new w.URL("/component_sys/");

                    update_url.submitJSON({
                        action:"update",
                        location:url,
                        source:string
                    });
                },

                setEditingComp(comp_data){
                    w.rt.presets.models.flame_editor_model.component_tabs = [comp_data];
                }

            },

            models: {
                flame_editor_model : { component_tabs : [] }
            }
        });
    }
</script>
        `);

        if (!USE_RADIATE_RUNTIME) {
            file = addScript(file, `
<script>
    window.addEventListener("load", async () => {
        const w = wick.default; 

        const app_root = document.getElementById("app");

        if (!app_root)  console.error("Could not find root app element.");

        const editor_frame = await (w("/flame/editor/component_editor.jsx").pending);
    
        document.body.appendChild((new editor_frame.class()).ele);

        await w.setWrapper("/flame/editor/editor.jsx");
        
        const c = new (w.rt.getComponent("${component.name}"))(null, app_root);
    })
</script>`);
        }

        file = createComponentScript(file, components, comp => {

            const comp_class_string = wick.componentToClassString(comp, presets, false, true);

            return (`w.rt.registerComponent("${comp.name}",((c, p, rt)=>${comp_class_string})({
                            location : "${comp.location}",
                            source : \`${
                comp.source
                    .replace(/\`/g, "\\\`")
                    .replace(/\n/g, "\\n")
                    .replace(/\t/g, "\\t")
                }\`,
                            name: "${comp.name}",
                        }, w.rt.presets, w.rt));`);
        });
    }

    const { template_map, html } = getComponentHTML(component, presets);

    file = addBody(file, html);
    file = addTemplate(file, [...template_map.values()].join("\n"));


    return {
        html: `<!DOCTYPE html>
<html>
    <head>
        ${file.header.trim().split("\n").join("\n\t\t")}
    </head>
    <body>
        ${file.body_html.trim().split("\n").join("\n\t\t")}
        ${file.templates.trim().split("\n").join("\n\t\t")}
        ${file.scripts.trim().split("\n").join("\n\t\t")}
    </body>
</html>`
    };
};

function getComponentHTML(comp: Component, presets: Presets, template_map = new Map, html = comp.HTML, root = true): { html: string, template_map: Map<string, string>; } {

    let str = "";

    if (html) {
        //Convert html to string 

        const {
            t: tag_name = "",
            a: attributes = [],
            c: children = [],
            d: data,
            ct,
            cp: component_name,
            sl: slot_name
        }: DOMLiteral = html;

        if (ct) {
            const
                comp = presets.components.get(component_name);

            if (!template_map.has(comp.name))
                template_map.set(comp.name, `<template id="${comp.name}">${getComponentHTML(comp, presets, template_map)}</template>`);
            //create template for the component. 

            str += `<${tag_name.toLowerCase()} ${attributes.map(([n, v]) => `"${n}"="${v}"`).join(" ")} w-container="${comp.name}">`;


        } else if (component_name && presets.components.has(component_name)) {

            const comp = presets.components.get(component_name);

            return getComponentHTML(comp, presets, template_map, undefined, false);

        } else if (tag_name)
            str += `<${tag_name.toLowerCase()} ${root ? "id=\"app\" " : ""}${attributes.map(([n, v]) => `${n}="${v}"`).join(" ")} ${comp.HTML == html ? `w-component="${comp.name}" class="${comp.name}"` : ""}>`;
        else
            str += `<w-b>${data}</w-b>`;

        for (const child of children)
            str += getComponentHTML(comp, presets, template_map, child, false).html;

        if (tag_name)
            str += `</${tag_name.toLowerCase()}>`;
    }

    return { html: str, template_map };
}

function getComponentGroup(comp: Component, presets: Presets, comp_name_set: Set<string> = new Set, out_array: Array<Component> = [comp]): Array<Component> {

    if (comp.bindings.length > 0 || comp.local_component_names.size > 0) {

        for (const name of comp.local_component_names.values()) {

            if (comp_name_set.has(name)) continue;

            comp_name_set.add(name);

            const comp = presets.components.get(name);

            out_array.push(comp);

            getComponentGroup(comp, presets, comp_name_set, out_array);
        }
    }

    return out_array;
}; 