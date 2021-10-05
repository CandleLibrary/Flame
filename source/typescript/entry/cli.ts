/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */

import lantern, {
    $404_dispatch, candle_library_dispatch, Dispatcher, ext_map, filesystem_dispatch, LanternServer
} from "@candlelib/lantern";
import { Logger } from "@candlelib/log";
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import URI from '@candlelib/uri';
import wick, {
    ComponentData
} from "@candlelib/wick";
import { WebSocketServer } from "ws";
import { Session } from './session.js';
import { loadComponents, store } from './store.js';

Logger.createLogger("lantern").deactivate();
Logger.createLogger("wick").activate();
const logger = Logger.createLogger("flame");
logger.activate();


URI.server();

function initializeWebSocketServer(lantern: LanternServer<any>) {

    const ws_server = new WebSocketServer({
        server: lantern.server
    });

    ws_server.on("connection", (connection) => {
        logger.get("WebSocket").log("Connection Made");
        new Session(connection);
    });

    ws_server.on("close", () => {
        logger.get("WebSocket").log("Websocket Server Closed");
    });

    ws_server.on("error", e => {
        logger.get("Websocket Error").log(e);
    });
}


async function renderPage(

    component: ComponentData,

): Promise<string> {

    try {
        const hooks = Object.assign({},
            component.RADIATE
                ? wick.utils.default_radiate_hooks
                : wick.utils.default_wick_hooks
        );

        if (component.RADIATE)
            hooks.init_script_render = function () {
                return `
				import init_router from "/@cl/wick-radiate/";
				init_router();
                import "/@cl/flame/";
                `;
            };

        else
            hooks.init_script_render = function () {
                return `
                import w from "/@cl/wick-rt/";
			    w.hydrate();
                import "/@cl/flame/";
                `;
            };


        return (await wick.utils.RenderPage(
            component,
            wick.rt.presets,
            hooks
        )).page;

    } catch (e) {
        console.log(e);
        throw e;
    }
};

const flaming_wick_dispatch = <Dispatcher>{
    name: "FLAMING_WICK",
    MIME: "text/html",
    keys: [],
    init(lantern, dispatcher) {
        lantern.addExtension("wick", "text/html");
        lantern.addExtension("html", "text/html");
        dispatcher.keys = [{ ext: ext_map.wick | ext_map.none, dir: "/*" }];
    },
    respond: async function (tools) {

        if ("" == tools.ext) {

            if (tools.url.path.slice(-1) !== "/") {
                //redirect to path with end delimiter added. Prevents errors with relative links.
                const new_path = tools.url;

                return tools.redirect(new_path.path + "/");
            }

            if (store.endpoints.has(tools.dir)) {

                const { comp } = store.endpoints.get(tools.dir);

                const page = await renderPage(comp);

                return tools.sendUTF8String(page);
            }
        }


        return false;
    }
};

addCLIConfig("server",
    {
        key: "server",
        help_brief:
            `
Starts a wick component server with integrated editing systems. 
`
    }
).callback = (
        async (args) => {

            let port = 8082;

            wick.rt.setPresets();


            const working_directory = new URI(process.cwd());

            await loadComponents(working_directory, wick.rt.presets);

            const server = await lantern({
                port,
                //type: "http",
                //secure: lantern.mock_certificate
            });

            server.addDispatch(flaming_wick_dispatch);

            server.addDispatch(candle_library_dispatch);
            server.addDispatch(filesystem_dispatch);
            server.addDispatch($404_dispatch);

            initializeWebSocketServer(server);
        }
    );

addCLIConfig("lsif",
    {
        key: "lsif",
        help_brief:
            `
Starts flame in language server mode
`
    }
).callback = (
        async (args) => {

            await import("@candlelib/flame/vscode_server/bin/server.js");

        }
    );

processCLIConfig();

