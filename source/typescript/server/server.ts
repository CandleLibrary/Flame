#! /usr/bin/node
import lantern from "@candlefw/lantern";
import wick from "@candlefw/wick";
import {
    poller_dispatch,
    candlefw_dispatch,
    $404_dispatch,
} from "@candlefw/lantern";

import { renderPage, SourceType } from "../renderer/render.js";
//import database from "./database.js";

import { fileURLToPath } from 'url';
import path from "path";
import fs from "fs";
import util from 'util';
import child from 'child_process';


const
    exec = util.promisify(child.exec),
    fsp = fs.promises,
    __filename = fileURLToPath(import.meta.url),
    __dirname = path.dirname(__filename),
    __root_dir = path.join(__dirname, "../../../"),
    cwd = process.cwd();

lantern({
    port: parseInt(process.env.PORT) || 8080,
    host: "localhost"
})
    .then(async server => {
        //Configure wick to run server side
        await wick.utils.server();

        server.addExtension("jsx", "text/plain");
        server.addExtension("whtml", "text/plain");

        //  for (const handler of database(server))
        //      server.addDispatch(handler);

        async function gitCommit(message: string): Promise<boolean> {
            try {
                {
                    const { stdout, stderr } = await exec(`git add .`, { cwd: process.cwd() });
                    console.log('stdout:', stdout);
                    console.error('stderr:', stderr);
                }
                {
                    const { stdout, stderr } = await exec(`git commit -m "${message}" -a`, { cwd: process.cwd() });
                    console.log('stdout:', stdout);
                    console.error('stderr:', stderr);
                }
            } catch (e) {
                console.error(e);
                return false;
            }
            return true;
        }

        server.addDispatch(

            /**
             * Handles the wrapping and edit update of components.
             */
            {
                name: "FLAME_EDIT",
                MIME: "application/javascript",
                respond: async function (tools) {

                    tools.setMIMEBasedOnExt();

                    return tools.sendRawStreamFromFile(path.join(__root_dir, "source/editor/", tools.dir.replace("/flame/editor", ""), tools.file));
                },

                keys: [{ ext: server.ext.all, dir: "/flame/editor/*" }]

            },

            {
                name: "FLAME_RADIATOR",
                MIME: "application/javascript",
                respond: async function (tools) {

                    tools.setMIME();

                    return tools.sendRawStreamFromFile(path.join(__root_dir, "bin/", "radiate.js"));
                },

                keys: [{ ext: server.ext.all, dir: "/flame/router" }]

            },

            /**
             * Handles the wrapping and edit update of components.
             */
            {
                name: "FLAME_SOURCE_DATA",
                MIME: "application/javascript",
                respond: async function (tools) {

                    const data = await tools.getJSONasObject();

                    if (data) {
                        switch (data.action) {
                            case "update":
                                try {

                                    await fsp.writeFile(path.join(cwd, data.location), data.source);

                                    // await gitCommit(`Updated ${data.location}`);

                                } catch (e) {
                                    tools.error(e);
                                }


                                return true;
                        }
                    }
                },

                keys: [
                    { ext: server.ext.all, dir: "/component_sys/*" }
                ]

            },
            {
                name: "CodeMirror",
                MIME: "text/html",
                respond: async function (tools) {

                    //look for index html;
                    tools.setMIMEBasedOnExt();

                    return tools.sendRawStreamFromFile(path.join(__root_dir, "bin/codemirror", tools.file));
                },
                keys: { ext: server.ext.all, dir: "/cm" }
            },
            candlefw_dispatch,
            {
                name: "FLAME_RUNTIME_EDITOR",
                description:
                    `This systems provides an ad hoc editing environment to wick components. It will dynamically build a wick 
                     component based page and inject server communication code to update these components as changes are made 
                     client side.`,
                MIME: "text/html",
                respond: async function (tools) {

                    //load wick data 
                    if ("" == tools.ext) {

                        if (tools.url.path.slice(-1) !== "/") {
                            //redirect to path with end delimiter added. Prevents errors with relative links.
                            const new_path = tools.url;

                            new_path.path += "/";

                            return tools.redirect(new_path.path);
                        }

                        let url = "";

                        try {
                            if (await fsp.stat(path.join(cwd, tools.dir, "index.jsx")))
                                url = path.join(cwd, tools.dir, "index.jsx");
                        } catch (e) { }


                        try {
                            if (await fsp.stat(path.join(cwd, tools.dir, "index.html")))
                                url = path.join(cwd, tools.dir, "index.html");
                        } catch (e) { }

                        if (!url) return false;

                        tools.setHeader("Access-Control-Allow-Origin", "*");

                        const { html } = await renderPage(url, wick, {
                            source_type: SourceType.COMBINED,
                            USE_FLAME_RUNTIME: tools.url.getData().flaming || false,
                            source_url: tools.url
                        });

                        tools.setMIMEBasedOnExt("html");

                        return tools.sendUTF8String(html);

                    } else {
                        //If the indexed resource at root of directory is a jsx or whtml file, then load as a wick component. 
                    }

                    return false;
                },

                keys: [
                    { ext: server.ext.all, dir: "/*" },
                ]
            },
            {
                name: "General",
                MIME: "text/html",
                respond: async function (tools) {

                    if (!tools.ext) {

                        if (tools.url.path.slice(-1) !== "/") {
                            //redirect to path with end delimiter added. Prevents errors with relative links.
                            const new_path = tools.url;

                            new_path.path += "/";

                            return tools.redirect(new_path.path);
                        }

                        //look for index html;
                        tools.setMIME();

                        return tools.sendUTF8FromFile(path.join(cwd, tools.dir, tools.file || "", "index.html"));
                    }

                    tools.setMIMEBasedOnExt();

                    return tools.sendRawStreamFromFile(path.join(cwd, tools.dir, tools.file));
                },
                keys: { ext: server.ext.all, dir: "/*" }
            },
            poller_dispatch,
            $404_dispatch
        );
    });