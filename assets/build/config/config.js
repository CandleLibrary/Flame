import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
    input: "./assets/source/main.mjs",

        treeshake: false,

    output: [{
        name: "flame",
        file: "./assets/build/flame-dev.js",
        format: "iife"
    },{
        name :"flame",
        file: "./assets/build/flame.node.js",
        format: "cjs",
        sourcemap: true
    }],
    external : ["path", "fs"],
    plugins: [commonjs({ include: ['./main.js', './node_modules/*.*'] }),            resolve()]
};