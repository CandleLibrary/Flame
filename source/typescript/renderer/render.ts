import { Component, Presets, componentDataToClassString, componentDataToCSS, componentDataToHTML } from "@candlefw/wick";
import URL from "@candlefw/url";

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
    source_url: URL,
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
    createComponentScript = (file, components, fn, after = "") => {
        const str = components.map(fn).join("\n\t") + "\n" + after;
        return addScript(file, `
<script id="wick-components">{
    window.addEventListener("load", async () => {
    const w = wick.default;
    ${str}})
}
</script>`);
    },
    createModuleComponentScript = (file, components, fn, after = "") => {
        const str = components.map(fn).join("\n\t") + "\n" + after;
        return addScript(file, `
<script async type="module" id="wick-components">
    import flame from "/flame/editor/build/library/main.js";
    window.addEventListener("load", async () => {
    const w = wick.default;
    ${str}})
</script>`);
    },
    createComponentStyle = (file, components, fn) => {
        const str = components.map(fn).join("\n");
        return addHeader(file, `<style id="wick-css">${str}\n</style>`);
    };
export const renderPage = async (source: String | Component, wick, options: RenderOptions): Promise<{ html?: string, js?: string, css?: string; }> => {

    await wick.server();

    const {
        USE_RADIATE_RUNTIME = false,
        USE_FLAME_RUNTIME = false,
        source_url
    } = options;

    let component: Component = null, presets = await wick.setPresets();

    if (typeof (source) == "string") {
        component = await wick(source, presets).pending;
    } else if (isWickComponent(source))
        component = source;

    if (!component) throw new Error("source is not a wick component!");

    let file = Object.assign({}, FILE);

    const components = getComponentGroup(component, presets);

    if (!USE_FLAME_RUNTIME) {

        if (USE_RADIATE_RUNTIME) {
            file = addHeader(file, `<script src="/flame/router/radiate"></script>`);
            file = addScript(file, `<script>{const w = wick.default; cfw.radiate("${component.name}");}</script>`);
        }


        file = addHeader(file, `<script async src="/cfw/wickrt"></script>`);
        file = addHeader(file, `<script async src="/cfw/glow"></script>`);
        file = addHeader(file, `<link href="https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@100&display=swap" rel="stylesheet">`);
        file = addScript(file, `<script>window.addEventListener("load", async () => wick.default.setPresets({})); </script>`);

        file = createComponentScript(file, components, comp => {
            const comp_class_string = componentDataToClassString(comp, presets, false, false);
            return `w.rt.rC(${comp_class_string});`;
        });

        file = createComponentStyle(file, components, (component) => {
            const style = componentDataToCSS(component);

            return `/*  ${component.location}  */\n${style}`;
        });

        if (!USE_RADIATE_RUNTIME) {
            file = addScript(file, `
<script async>
    window.addEventListener("load", async () => {
        const w = wick.default; 
        const app_root = document.getElementById("app");
        if (!app_root)  console.error("Could not find root app element.");        
        const c = new (w.rt.gC("${component.name}"))(null, app_root);
    })
</script>`);
        }

        const { template_map, html } = componentDataToHTML(component, presets);

        file = addBody(file, html);
        file = addTemplate(file, [...template_map.values()].join("\n"));

    } else {

        file = addHeader(file, `<script src="/cfw/wick"></script>`);
        file = addHeader(file, `<script src="/cfw/css"></script>`);
        file = addHeader(file, `<script async src="/cfw/glow"></script>`);

        file = addHeader(file, `<script src="/cm/codemirror.js"></script>`);
        file = addHeader(file, `<link href="/cm/codemirror.css" rel="stylesheet"/>`);

        //file = addHeader(file, `<script type="module" src="/flame/editor/build/library/main.js"></script>`);
        file = addHeader(file, `<link href="/flame/editor/flame.css" rel="stylesheet"/>`);
        const unflamed_url = new URL(source_url);

        unflamed_url.setData("flaming", false);

        file = addBody(file, `<iframe cors="* default-src 'self'" sandbox="allow-same-origin allow-scripts" id="composition" style="border:none;margin:0;position:absolute;width:100vw;height:100vh;top:0;left:0;" src="${unflamed_url}"></iframe>`);

        file = addScript(file, `        
<script async>
    {
        const w = cfw.wick; 
        
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

        // file = createComponentStyle(file, components, (component) => {
        //     const style = componentDataToCSS(component);
        //
        //     return `/*  ${component.location}  */\n${style}`;
        // });

        file = createModuleComponentScript(file, components, comp => {

            const comp_class_string = wick.componentToClassString(comp, presets, false, false);

            return (`await w( "${comp.location.toString().replace(process.cwd(), "")}").pending;`);
        }, `const composition = document.getElementById("composition");
            const comp_cfw = composition.contentWindow.cfw;

            flame(cfw, comp_cfw, composition.contentWindow);
        `);
    }


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

function getComponentGroup(
    comp: Component,
    presets: Presets,
    comp_name_set: Set<string> = new Set,
    out_array: Array<Component> = [comp]
): Array<Component> {

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