import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default [{
    input: "./assets/source/flame.mjs",
    treeshake: false,
    output: [{
        name: "flame",
        file: "./assets/build/flame.js",
        format: "iife",
      sourcemap: true
    }],
    plugins: [commonjs({ include: ['./main.js', './node_modules/*.*'] }), resolve()]
},{
    input: "./assets/source/flame.wick.mjs",
    treeshake: false,
    output: [{
        name: "wick",
        file: "./assets/build/flame.wick.js",
        format: "iife",
      sourcemap: true
    }],
    plugins: [commonjs({ include: ['./main.js', './node_modules/*.*'] }), resolve()]
},{
    input: "./assets/source/flame.radiate.mjs",
    treeshake: false,
    output: [{
        name: "radiate",
        file: "./assets/build/flame.radiate.js",
        format: "iife",
      sourcemap: true
    }],
    plugins: [commonjs({ include: ['./main.js', './node_modules/*.*'] }), resolve()]
}];
