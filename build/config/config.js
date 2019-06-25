import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [{
    input: "./source/flame.mjs",
    treeshake: false,
    output: [{
        name: "flame",
        file: "./build/flame.js",
        format: "iife",
        sourcemap: "inline",
        exports:"default"
    }],
    plugins: [commonjs({ include: ['./node_modules/*.*'] }), resolve()]
}];
