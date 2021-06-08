/**
 * Main flame entry point. By default will run an init process to gather information for
 * running flame applications. 
 * 
 * flame server - Skips initialization and runs an add hoc local web server.
 * 
 * flame build - Compiles cfw and web files and places into a static site directory. 
 */

import { initWickCLI, getPackageJsonObject, savePackageJSON, getProcessArgs } from "@candlelib/paraffin";
import URL from "@candlelib/url";
import { FlameCLISettings } from "./FlameSettings";
import { startServer } from "./server/server.js";
import node_path from "path";
import fs from "fs";
const fsp = fs.promises;
import wick from "@candlelib/wick";
import { renderPage } from "./renderer/render.js";

(async function start() {

    const
        flame = await getPackageJsonObject(URL.getEXEURL(import.meta) + ""),
        repo = await getPackageJsonObject(),
        result = getProcessArgs({
            build: false,
            server: false
        }),
        sub_command = result.__array__?.[0]?.[0];

    if (sub_command) {
        const wick = await initWickCLI();
        //If there is a flame section in the package then we are golden.
        if (!repo.package.flame_settings) {
            //Load initializer

            const settings: FlameCLISettings = <any>{};

            await (await wick.cli(URL.resolveRelative("./source/wick-templates/init.wick", flame.package_dir), settings)).start();

            repo.package.flame_settings = Object.assign({
                input_dir: "sources/public",
                output_dir: "build/public",
                RADIATE: true,
                commit_rate: "50c",
                flame_branch: "flame",
                COMMIT_ON_UNDO: false,
                commit_msg_template: "Committing flame editor changes"
            }, settings);

            //save the new package
            await savePackageJSON(repo.package, repo.package_dir);
        }



        switch (sub_command) {
            case "server":
                startServer(flame.package_dir, URL.resolveRelative("./" + repo.package.flame_settings.input_dir, repo.package_dir) + "");
                break;
            case "build":
                await build(
                    URL.resolveRelative("./" + repo.package.flame_settings.input_dir, repo.package_dir + "/"),
                    URL.resolveRelative("./" + repo.package.flame_settings.output_dir, repo.package_dir + "/"),
                );
                break;
            default:
                console.warn("Could not find action for subcommand " + sub_command);
        }
    } else {
        startServer(flame.package_dir);
    }
})();

/**
 * Builds a static site from all index.wick/index.html files in the input folders. 
 * @param input_dir 
 * @param output_dir 
 */
async function build(input_dir, output_dir) {

    //move wick to js directory
    //const { modules } = await loadImports("@candlelib/wick");
    //const script = createGraph(modules);
    //await fsp.mkdir(output_dir + "src/", { recursive: true });
    //await fsp.writeFile(output_dir + "src/" + "wick.js", script);

    for await (const { ext, file_name, url, relative_url } of getFilesFromDirectory(input_dir)) {

        const new_filepath = URL.resolveRelative(relative_url, output_dir + "/");

        if (file_name == "index" && ext == "wick" || ext == "html") {

            const { html } = await renderPage(url + "", wick, {
                source_type: 1,
                USE_FLAME_RUNTIME: false,
                source_url: relative_url,
                sources: {
                    wick: "/src/wick.js",
                    glow: "/src/glow.js",
                }
            });

            console.log({ html, new_filepath, output_dir, relative_url });

            try {
                await fsp.mkdir(new_filepath.dir, { recursive: true });
                await fsp.writeFile(new_filepath.dir + "index.html", html);
            } catch (e) {
                console.log(e);
            }

        } else if ([
            "png",
            "jpg",
            "svg",
            "otf",
            "ttf"
        ].includes(ext)) {
            try {
                await fsp.mkdir(new_filepath.dir, { recursive: true });
                await fsp.writeFile(new_filepath + "", await fsp.readFile(url + ""));
            } catch (e) {
                console.log(e);
            }
        }
    }
}

export async function* getFilesFromDirectory(dir: URL): AsyncGenerator<{ file_name: string; url: URL; relative_url: URL, ext: string; }> {
    //recursively load data from all sub-folders
    const pending: { dir_type: "file" | "directory"; relative_path: string, path: string; }[] = [{
        dir_type: "directory",
        relative_path: ".",
        path: dir.toString()
    }];

    for (let i = 0; i < pending.length; i++) {

        const { dir_type, path, relative_path } = pending[i];

        if (dir_type == "directory") {
            try {
                for (const candidate of await fsp.readdir(path, { withFileTypes: true })) {

                    const
                        new_path = node_path.join(path, "/", candidate.name),
                        new_relative_path = relative_path + "/" + candidate.name;

                    if (candidate.isDirectory()) {
                        pending.push({ dir_type: "directory", path: new_path, relative_path: new_relative_path });
                    }
                    else if (candidate.isFile()) {
                        pending.push({ dir_type: "file", path: new_path, relative_path: new_relative_path });
                    }
                }
            } catch (e) {
                console.log(e);
            }
        }
        else {
            console.log({ relative_path });
            const
                url = new URL(path),
                relative_url = new URL(relative_path);

            yield { file_name: url.filename, ext: url.ext, url, relative_url };
        }
    }
}