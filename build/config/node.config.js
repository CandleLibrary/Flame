export default {
    input: "./source/main",
    treeshake: false,
    output: {
        file: "./build/flame.node.js",
        format: "cjs",
    },
    external: ["wick"],
    plugins: []
}