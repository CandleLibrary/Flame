
import * as path from 'path';
import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client = null;

export function activate(context) {
    console.log("ONby");

    const serverModule = context.asAbsolutePath(
        path.join('index.js')
    );

    console.log(serverModule);

    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.pipe/* , runtime: "^16.0.0" */,
            args: ["lsif"]
        },
        debug: {
            module: serverModule,
            transport: TransportKind.pipe,
            options: debugOptions,
            args: ["lsif"]
        }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for plain text documents
        documentSelector: [{ scheme: 'file', language: 'wick-component' }],
        synchronize: {
            // Notify the server about file changes to '.clientrc files contained in the workspace
            fileEvents: workspace.createFileSystemWatcher('**/.clientrc')
        }
    };

    const client = new LanguageClient(
        'FlameLanguageServer',
        'FlameLanguageServer',
        serverOptions,
        clientOptions
    );

    const d = client.start();

    console.log();
};

export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
};