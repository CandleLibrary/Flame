/**
 * Copyright (C) 2021 Anthony Weathersby - Flame Language Server & Dev Server
 */
import { Logger } from "@candlelib/log";
import {
    addCLIConfig, processCLIConfig
} from "@candlelib/paraffin";
import lantern from '@candlelib/lantern';



const port_handle = addCLIConfig("dev-server",
    {
        key: "port",
        REQUIRES_VALUE: true,
        accepted_values: [Number, "random"],
        default: "8082",
        help_brief:
            `
Specify a port number for the server. Must be in the range 0 - 65836
Alternatively, \`random\` can be specified to allow Flame to choose 
an available random port.

If a port number or \`random\` is not specified, then Flame will use
the port number assigned to FLAME_PORT environment variable. If if
FLAME_PORT has no value, then the default port 8082 will be tried,
and failing that, a random port number will be selected.
`

    }
);
async function getPortNumber(port = port_handle.value) {

    const
        env_port = parseInt(process.env.FLAME_PORT),
        arg_port = port,
        USE_RANDOM = arg_port == "random";

    if (USE_RANDOM)
        return await lantern.getUnusedPort();

    const candidates = [parseInt(arg_port), env_port, 8080];

    for (const candidate of candidates)
        if (typeof candidate == "number" && candidate > 0 && candidate < 65536)
            return candidate;
}

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

        const port = await getPortNumber();

        Logger.get("flame").activate().log(`Using local network port [ ${port} ]`);

        (await import('../server/development/flame_dev_server.js'))
            .initDevServer(port);
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
