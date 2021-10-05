
import * as path from 'path';

import { workspace, ExtensionContext } from 'vscode';

import {
    LanguageClient,
    LanguageClientOptions,
    ServerOptions,
    TransportKind
} from 'vscode-languageclient/node';

let client = null;

export function activate(context: ExtensionContext) {

    const serverModule = context.asAbsolutePath(
        path.join('index.js')
    );

    const debugOptions = { execArgv: ['--nolazy', '--inspect=6009'] };

    const serverOptions: ServerOptions = {
        run: {
            module: serverModule,
            transport: TransportKind.pipe,
            args: ["vscode-language-server"]
        },
        debug: {
            module: serverModule,
            transport: TransportKind.pipe,
            options: debugOptions,
            args: ["vscode-language-server"]
        }
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
        // Register the server for Wick Components and Hydrocarbon Grammar Files
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

    client.start();
};

export function deactivate() {
    if (!client) {
        return undefined;
    }
    return client.stop();
};