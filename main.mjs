#!/bin/sh

":" //# comment; exec /usr/bin/env node --experimental-modules "$0" "$@"

import lantern from "@candlefw/lantern";
import wick from "@candlefw/wick";

wick.polyfill();

import path from 'path';
import fs from "fs";
const fsp = fs.promises;

const flame_root = path.join(new URL(import.meta.url).pathname, "../");

lantern.addExtensionKey("app");

async function loadData() {
    /** Defualt responses **/

    lantern.addDispatch({
        name: "CFW Flame Assets",
        keys: { ext: lantern.ext.any | lantern.ext.all, dir: "/flame/*" },
        respond: async (tools) => {
            console.log("ASSSSSSSSSSSSSSSSSSSSSSSSSSS")
            console.warn(tools.dir, tools.filename)
            tools.setMIMEBasedOnExt();
            return tools.sendString(await fsp.readFile(path.join(flame_root,"assets", ...tools.dir.split("/").slice(2), tools.filename)), "utf8");
        },
    },{
        name: "CFW Flame Service Worker",
        keys: { ext: lantern.ext.js, dir: "/" },
        respond: async (tools) => {
            tools.setMIMEBasedOnExt("js");
            return tools.sendString(await fsp.readFile(path.join(flame_root, "./assets/source/service_worker.js")), "utf8");
        }
    }, {
        name: "CFW Flame Style Files",
        keys: { ext: lantern.ext.css, dir: "/cfw/css/*" },
        respond: async (tools) => {
            tools.setMIMEBasedOnExt("css");
            return  tools.sendString(await fsp.readFile(path.join(flame_root,"assets",...tools.dir.split("/").slice(2), tools.fn + "."+tools.ext)), "utf8");
            tools.sendUTF8(path.join(path.join(flame_root,"./assets/css/"), tools.fn + "."+tools.ext));
        },
    }, {
        name: "CFW Builtins",
        keys: { ext: 0x1, dir: "/cfw" },
        respond: async (tools) => {
            switch (tools.fn) {
                case "flame_ignite":
                    tools.setMIMEBasedOnExt("html");
                    return tools.sendString(await fsp.readFile(path.join(flame_root, "./assets/html/flame_sys.html")), "utf8");
                case "radiate":
                    tools.setMIMEBasedOnExt("js");
                    return tools.sendString(await fsp.readFile(path.join(flame_root, "./assets/build/flame.radiate.js")), "utf8");
                case "wick":
                    tools.setMIMEBasedOnExt("js");
                    return tools.sendString(await fsp.readFile(path.join(flame_root, "./assets/build/flame.wick.js")), "utf8");
                case "flame":
                    tools.setMIMEBasedOnExt("js");
                    return tools.sendString(await fsp.readFile(path.join(flame_root, "./assets/build/flame.js")), "utf8");
            }

            return tools.sendUTF8(path.join(path.join(flame_root,"./assets/css/"), tools.fn + "."+tools.ext));
        },

    });
}

async function start() {
    await loadData();

    //Load the template
    //Ignitor
    // Responsible in ensuring any new HTTP connection is served through a Flame Systems Handler


    lantern.addDispatch(/*{
        name: "Flame Cookie Catch",
        keys: { ext: lantern.ext.all, dir: "*" },
        respond: async function(tools) {
            
            const cookie = tools.getHeader("cookie");
            
            if (!cookie) {
                return tools.redirect(`/cfw/flame_ignite?d=${tools.req.url}`);
            } else
                return false;
        }
    }, */{
        name: "General",
        MIME: "text/html",
        keys: { ext: lantern.ext.all, dir: "*" },
        respond: async function(tools) {
            tools.setMIMEBasedOnExt();
            return tools.sendUTF8(path.join(tools.dir, tools.fn + "."+tools.ext));
            return false;
        }
    }, {
            name: "iFrame Fetch",
            keys: { ext: lantern.ext.all, dir: "/iframe/*" },
            respond: (tools) => {
                tools.setMIMEBasedOnExt();
                return tools.sendUTF8(path.join(...tools.dir.split("/").slice(2), tools.fn + "."+tools.ext));
            }
        });
    lantern({ port: process.env.PORT || 8080, server_name:"Flame BE" });
}


start();
