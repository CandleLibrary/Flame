import resolve from 'rollup-plugin-node-resolve';

const output = [{
    name: "flame",
    file: "./source/editor/flame.js",
    format: "iife",
    globals: { "cfw": "cfw" },
}];

export default {
    input: "./source/editor/scripts/main.js",
    treeshake: { unknownGlobalSideEffects: true },
    output,
    plugins: [resolve({ jail: "", modulesOnly: true })],
    shimMissingExports: true
};

