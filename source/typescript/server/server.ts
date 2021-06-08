#! /usr/bin/node
import lantern, {
    $404_dispatch, candle_library_dispatch, poller_dispatch, filesystem_dispatch, compiled_wick_dispatch
} from "@candlelib/lantern";
import wick from "@candlelib/wick";
import child from 'child_process';
import fs from "fs";
import path from "path";
//import database from "./database.js";
import { fileURLToPath } from 'url';
import util from 'util';
import { flame_page_editor_initializer, renderPage, SourceType } from "../renderer/render.js";


export function startServer(flame_dir, cwd = process.cwd()) {

    const
        exec = util.promisify(child.exec),
        fsp = fs.promises,
        __filename = fileURLToPath(import.meta.url),
        __dirname = path.dirname(__filename);

    lantern({
        port: parseInt(process.env.PORT) || 8080,
        //host: "0.0.0.0",
        //type: "http2",
        //secure: lantern.mock_certificate
    })
        .then(async server => {
            //Configure wick to run server side

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
                        const str = await tools.getUTF8FromFile(path.join(flame_dir, "source/editor/", tools.dir.replace("/flame/editor", ""), tools.file));
                        //tools.setMIMEBasedOnExt(ext || "js");
                        return tools.sendUTF8String(str.replace(/\"\@candlelib\/([^\/\"]+)/g, "\"/@cl\/$1/"));
                    },

                    keys: [{ ext: server.ext.all, dir: "/flame/editor/*" }]

                },

                {
                    name: "FLAME_RADIATOR",
                    MIME: "application/javascript",
                    respond: async function (tools) {

                        tools.setMIME();

                        return tools.sendRawStreamFromFile(path.join(flame_dir, "bin/", "radiate.js"));
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

                        return tools.sendRawStreamFromFile(path.join(flame_dir, "bin/codemirror", tools.file));
                    },
                    keys: { ext: server.ext.all, dir: "/cm" }
                },
                flame_page_editor_initializer(server, cwd),
                compiled_wick_dispatch,
                candle_library_dispatch,
                filesystem_dispatch,
                poller_dispatch,
                $404_dispatch
            );
        });
}