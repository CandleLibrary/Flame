import resolve from 'rollup-plugin-node-resolve';

const output = [{
    name: "radiate",
    file: "./bin/radiate.js",
    format: "iife",
    globals: { "worker_threads": "null", "os": "null" },
}];

export default {
    input: "./build/library/client/radiate.js",
    treeshake: { unknownGlobalSideEffects: true },
    output,
    plugins: [resolve({ jail: "", modulesOnly: true })],
    shimMissingExports: true
};

