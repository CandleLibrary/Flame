export default {
    input: "./assets/source/main",
    treeshake: false,
    output: {
        file: "./assets/build/flame.node.js",
        format: "cjs",
    },
    external: ["wick", "path", "fs", "charc"],
    plugins: []
}