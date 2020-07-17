#! /usr/bin/node
import lantern from "@candlefw/lantern";
import wick from "@candlefw/wick";
import {
    poller_dispatch,
    candlefw_dispatch,
    $404_dispatch,
} from "@candlefw/lantern";

import { renderPage, SourceType } from "../renderer/render.js";
import database from "./database.js";

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
    port: 8080,
    host: "127.0.0.1",
    secure: {
        cert:
            `-----BEGIN CERTIFICATE-----
MIIDzTCCArWgAwIBAgIUfVyj+bIDk5mznJSmVnKJFbusFBIwDQYJKoZIhvcNAQEL
BQAwdjELMAkGA1UEBhMCVVMxETAPBgNVBAgMCENvbG9yYWRvMQ8wDQYDVQQHDAZE
ZW52ZXIxDDAKBgNVBAoMA0NGVzEUMBIGA1UEAwwLaHlkcm9jYXJib24xHzAdBgkq
hkiG9w0BCQEWEGFudGhvbnlAdGVzdC50c3QwHhcNMjAwNjI5MTY0OTI4WhcNMjAw
NzA5MTY0OTI4WjB2MQswCQYDVQQGEwJVUzERMA8GA1UECAwIQ29sb3JhZG8xDzAN
BgNVBAcMBkRlbnZlcjEMMAoGA1UECgwDQ0ZXMRQwEgYDVQQDDAtoeWRyb2NhcmJv
bjEfMB0GCSqGSIb3DQEJARYQYW50aG9ueUB0ZXN0LnRzdDCCASIwDQYJKoZIhvcN
AQEBBQADggEPADCCAQoCggEBALpfKmJ2rbBkae18rGGn04H8LArieLmv15n0Nb5U
b1jv2XudPzASWSqcXUl3gKQPbPFV5CcP+vZHPfHxhltSQaIdIkRcNvHJhg1zcm8u
bTCeskmheTsPkYlfGSedXf4HmxXugUoWw6zrjnrnul5t7GWbQWlQnToBFCOxkWkP
k7/MSKasfEv9OABqsQEy0wWtcYXlqN4kM7T2pZk9LpvtnveBIvn5iQCGrx0G8U6d
yDQrtK284uCsVsbvMqLmHSoqTMksSh0PQUwBl9CKTzB4iCG8XmqmAYt891cbG+Ku
2ZGV14Q6UFkK15v+JkDnp5emNrV2BsPCg7g3Dl6dW3z9hAECAwEAAaNTMFEwHQYD
VR0OBBYEFOwxMT6xF1NRg8/UFZxfGtb07gSSMB8GA1UdIwQYMBaAFOwxMT6xF1NR
g8/UFZxfGtb07gSSMA8GA1UdEwEB/wQFMAMBAf8wDQYJKoZIhvcNAQELBQADggEB
AEn/MPqClQGW3Zw9CHoL+Yx+Y6ngf4YFAqf29ezfAf2yglTzFy7AA82/MVDja9RH
uHgvO43D0g0ARgtFk4CdFulhutereGR1sNJJMxTYzYuvtlEJxABHT6AzMFHJ3/dr
z+7MdAYpWqB8Ry8Ua6wqD0greXExnfq1UNlVMOIQKrVjyUKdi0rk4/HCrff3d5iQ
pne64Fg/01KxCBLtLzBVFKymt9jGPgyZC7VfsMPpk8jXQMC6JEe5rCDz18DDAtFV
UTlxJMR3dmC2HiFxVoSjWOeo68uiuFsC1MZA4LxxqLVYTRftzMaGCH1SQU8g5YKG
RqPZh4oy8kM2g7Wo+35d59M=
-----END CERTIFICATE-----
`,
        key:
            `-----BEGIN RSA PRIVATE KEY-----
MIIEpAIBAAKCAQEAul8qYnatsGRp7XysYafTgfwsCuJ4ua/XmfQ1vlRvWO/Ze50/
MBJZKpxdSXeApA9s8VXkJw/69kc98fGGW1JBoh0iRFw28cmGDXNyby5tMJ6ySaF5
Ow+RiV8ZJ51d/gebFe6BShbDrOuOeue6Xm3sZZtBaVCdOgEUI7GRaQ+Tv8xIpqx8
S/04AGqxATLTBa1xheWo3iQztPalmT0um+2e94Ei+fmJAIavHQbxTp3INCu0rbzi
4KxWxu8youYdKipMySxKHQ9BTAGX0IpPMHiIIbxeaqYBi3z3Vxsb4q7ZkZXXhDpQ
WQrXm/4mQOenl6Y2tXYGw8KDuDcOXp1bfP2EAQIDAQABAoIBAQCRM9vd4wDn0RQG
h3/2hb7wIvxdbp0IbsvXksDcjQRDknsrKBQ269S0siasOoLrT2ldjcG3/WdVwaOt
gLNhKvEf0PsFr6LPNmdOy4d4v/8qRjo5y6icL0EAeisrBhxY8qwNpkjs5FeHve7A
KxK0x4fKke+gkcItkvGR7aKQ7CX842PJj+bXc4t80ahPJiaGzdhLeSEwCC+RYUvR
EpYOy0db0kfJSnrive98nVBa27aUQ7B0OxvcKk08dPpI6oBWGFcdJlhDZXgLH6he
vzIe703iYyDjs2cPNFdVMqfwm6USbeNaBPvVWi0Iec7mUVqaUgFPEp8whWZNo3FO
tyvcruMBAoGBANtrw6jTxAgfzNTBNilBW5jAjflVHfHxFCWq6Gt8fC5g66TzuurG
wMtSbjCnQ0kYRkvZrTeUhXtyRI6h0eIdswDJ0X6ZwSk0RcdBHLqMaDjlet5P0cxu
vvQIskm4rKLO1tq8mK3xftC93TgUJCVkXjDT9U/G0mX+zQRQEJ/Lw75pAoGBANlw
9XVlR5d6l4mUchNpNW7+u3mpgaLiBdm0YXDzhC4mq3RMyUGbNyDYeHq93+8nzB3i
QyEfjx1lyESYByDqDGsnvOBH7x4Bg68JXRdY/cZVI4rHo9dnKzLjgdf70w5671Sp
GzKRJpPXA9V8mco4CAKBmdUI09g9NLLeHWp4jpXZAoGAGxKCw5PNPgteZGmqWxC7
Um9/lOHRngZWrAcYQhrL35UJvgJsb4cyRmPXQJ2CicQ6+CTVYGQsy/xfRRHmKXXs
ng5IkMw7ru/KJDl+Z+3m9g4qSL+kbQrE+KsSBFKKylOm4roeRGflc6/ZWY/yncJy
dKfSPpOTZg44EW4nfu/PKPECgYBveC4NYb9i03DuEdCtTMkcvq/jPdd8Zfxzz7oI
Sn5fnmlU9KxT2rtXNkIFQmOTWcaVJ1Icn+4hNvWE3J8C65k0MantHFNkAYi9acJ0
XqWyUCEpWxEOMxB9RQ5iZ/GZwcIBl7Oep7SsI5UOk5LPjQvmJQR0ptLbTv0+GQnh
dC48eQKBgQCO39vxqam2Hn+U0s79vMcbgZgMxMDvRnOWn+nsp4MOx3C+pKr4WZsN
WEXeY4A58mjmyG2jfhah146u6rhhj8Oy9RWtvL1rHjb37ZiYsh6rNVGwSBiQ54LO
o4VgkSlOvlFp6ZgQOoQc20Q33wS7RYtWz6ExZGW2btVHmgcwCNABfQ==
-----END RSA PRIVATE KEY-----`
    }
}, true)
    .then(async server => {
        //Configure wick to run server side
        await wick.server();

        server.addExtension("jsx", "text/plain");
        server.addExtension("whtml", "text/plain");

        for (const handler of database(server))
            server.addDispatch(handler);

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

                keys: [
                    { ext: server.ext.all, dir: "/flame/editor/*" }
                ]

            },

            {
                name: "FLAME_RADIATOR",
                MIME: "application/javascript",
                respond: async function (tools) {

                    tools.setMIME();

                    return tools.sendRawStreamFromFile(path.join(__root_dir, "bin/", "radiate.js"));
                },

                keys: [
                    { ext: server.ext.all, dir: "/flame/router" }
                ]

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
                                    await fsp.writeFile(data.location, data.source);

                                    await gitCommit(`Updated ${data.location}`);

                                } catch (e) {
                                    console.error(e);
                                }


                                return true;
                        }
                    }
                },

                keys: [
                    { ext: server.ext.all, dir: "/component_sys" }
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
                                url = path.join(tools.dir, "index.jsx");
                        } catch (e) { }

                        try {
                            if (await fsp.stat(path.join(cwd, tools.dir, "index.html")))
                                url = path.join(tools.dir, "index.html");
                        } catch (e) { }

                        if (!url) return false;

                        tools.setHeader("Access-Control-Allow-Origin", "*");

                        const { html } = await renderPage(url, wick, {
                            source_type: SourceType.COMBINED,
                            USE_FLAME_RUNTIME: tools.url.getData("flaming") || false,
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
                    { ext: server.ext.all, dir: "*" },
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
                keys: { ext: server.ext.all, dir: "*" }
            },
            poller_dispatch,
            $404_dispatch
        );
    });