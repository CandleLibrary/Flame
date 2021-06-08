import URL from "@candlelib/url";
import wick, {
    Component,
    Presets,
    WickLibrary
} from "@candlelib/wick";

import path from "path";
import fs from "fs";
const fsp = fs.promises;

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

    sources?: {
        wick?: string;
        glow?: string;
    };
}

const FILE = {
    header: "",
    body_html: "",
    templates: "",
    scripts: "",
};

function getComponentGroup(
    comp: Component,
    presets: Presets,
    comp_name_set: Set<string> = new Set,
    out_array: Array<Component> = [comp]
): Array<Component> {


    if (comp && (comp.hooks.length > 0 || comp.local_component_names.size > 0)) {

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

const
    addHeader = (file, header_data) => Object.assign({}, file, { header: file.header + "\n" + header_data }),
    addBody = (file, body_data) => Object.assign({}, file, { body_html: file.body_html + "\n" + body_data }),
    addScript = (file, script_data) => Object.assign({}, file, { scripts: file.scripts + "\n" + script_data }),
    createModuleComponentScript = (file, components, fn, after = "") => {
        console.log(components);
        const str = components.filter(c => c.location.toString() != "auto_generated").map(fn).join("\n\t") + "\n" + after;
        return addScript(file, `
<script async type="module" id="wick-components">
    import flame from "/flame/editor/build/library/entry.js";
    import * as cfw from "/flame/editor/build/library/env.js";
    import w from "/@cl/wick/";
    window.addEventListener("load", async () => {
   // w.rt.setPresets({});
    
    w.rt.setPresets({
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

    //const w = wick.default;
    ${str}})
</script>`);
    };
export const renderPage = async (
    source: string,
    request_url: URL
): Promise<string> => {

    let
        presets = wick.setPresets(),
        component: Component = await wick(source, presets);

    if (!component) throw new Error("source is not a wick component!");

    let file = Object.assign({}, FILE);

    const components = getComponentGroup(component, presets);

    file = addHeader(file, `<script type="module" src="/@cl/wick/"></script>`);
    file = addHeader(file, `<script type="module" src="/@cl/css/"></script>`);
    file = addHeader(file, `<script type="module" async src="/@cl/glow/"></script>`);
    file = addHeader(file, `<script src="/cm/codemirror.js"></script>`);
    file = addHeader(file, `<link href="/cm/codemirror.css" rel="stylesheet"/>`);
    file = addHeader(file, `<link href="/flame/editor/flame.css" rel="stylesheet"/>`);

    const unflamed_url = new URL(request_url);

    unflamed_url.setData({ flaming: false });

    file = addBody(file, `<iframe cors="* default-src 'self'" sandbox="allow-same-origin allow-scripts" id="composition" style="border:none;margin:0;position:absolute;width:100vw;height:100vh;top:0;left:0;" src="${unflamed_url}"></iframe>`);

    file = createModuleComponentScript(file, components, comp => {

        return (`await w( "${comp.location.toString().replace(process.cwd(), "")}");`);

    }, `const composition = document.getElementById("composition");

        const comp_cfw = composition.contentWindow.cfw;

        flame(cfw, comp_cfw, composition.contentWindow);`);

    return `<!DOCTYPE html>
<html>
    <head>
        ${file.header.trim().split("\n").join("\n\t\t")}
    </head>
    <body>
        ${file.body_html.trim().split("\n").join("\n\t\t")}
        ${file.templates.trim().split("\n").join("\n\t\t")}
        ${file.scripts.trim().split("\n").join("\n\t\t")}
    </body>
</html>`;
};

export const flame_page_editor_initializer = (server, cwd) => ({
    name: "FLAME_RUNTIME_EDITOR",
    description:
        `This systems provides an ad hoc editing environment to wick components. It will dynamically build a wick 
     component based page and inject server communication code to update these components as changes are made 
     client side.`,
    MIME: "text/html",
    respond: async function (tools) {

        //load wick data 
        if ("" == tools.ext && tools.url.getData().flaming) {

            if (tools.url.path.slice(-1) !== "/") {
                //redirect to path with end delimiter added. Prevents errors with relative links.
                const new_path = tools.url;

                new_path.path += "/";

                return tools.redirect(new_path.path);
            }

            let url = "";

            try {
                if (await fsp.stat(path.join(cwd, tools.dir, "index.wick")))
                    url = path.join(cwd, tools.dir, "index.wick");
            } catch (e) { }


            try {
                if (await fsp.stat(path.join(cwd, tools.dir, "index.html")))
                    url = path.join(cwd, tools.dir, "index.html");
            } catch (e) { }

            if (!url) return false;

            tools.setHeader("Access-Control-Allow-Origin", "*");

            const html = await renderPage(url, tools.url);

            tools.setMIMEBasedOnExt("html");

            return tools.sendUTF8String(html);

        }

        return false;
    },

    keys: [
        { ext: server.ext.all, dir: "/*" },
    ]
});
