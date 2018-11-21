import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: "./assets/source/main.js",
    inputOptions: {
        treeshake: {
            pureExternalModules: true,
        },
    },
    output: [{
        name: "flame",
        file: "./assets/build/flame-dev.js",
        format: "iife"
    }],
    external : ["path", "fs"],
    plugins: [commonjs({ include: ['./main.js', './node_modules/*.*'] }),            resolve()]
};