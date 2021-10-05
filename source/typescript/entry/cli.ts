/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */
import { Logger } from "@candlelib/log";
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";

addCLIConfig("dev-server",
    {
        key: "dev-server",
        help_brief:
            `
Starts Flame in Wick component dev server mode with integrated editing systems for
editing of components within a browser and from within a code editor.            
`
    }
).callback =
    async (args) => {
        Logger.get("wick").activate();
        (await import('../server/development/flame_dev_server.js'))
            .initDevServer();
    };




addCLIConfig("vscode-language-server",
    {
        key: "vscode-language-server",
        help_brief:
            `
Starts Flame in language server mode for Visual Studio Code
`
    }
).callback =
    async (args) =>
        await import("../server/language/vscode.js");


processCLIConfig();
