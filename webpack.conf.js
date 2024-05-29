// 配置文件使用commonjs规范

const webpack = require("webpack");

const config = {
    mode: 'production',
    // 入口，是一个对象
    entry: {
        app: './src/index.js'
    },
    // 输出
    output: {
        globalObject: 'this',
        // 带五位hash值的js
        filename: 'nerve.min.js',
        library: "nerve",
        libraryTarget: "umd"
    },
    resolve: {
        alias: {
            "crypto": require.resolve("crypto-browserify"),
            "stream": require.resolve("stream-browserify"),
        }

    },
    plugins: [
        new webpack.ProvidePlugin({Buffer: ['buffer', 'Buffer']}),
        new webpack.ProvidePlugin({process:'process'}),
    ]
}
module.exports = config;
