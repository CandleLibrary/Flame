import resolve from 'rollup-plugin-node-resolve';
export default {
    input: "./source/main.js",
    inputOptions: {
        treeshake: {
            pureExternalModules: true,
        },
    },
    output: {
        name: "flame",
        file: "./build/flame-dev.js",
        format: "iife"
    },

    plugins: [resolve()]
};