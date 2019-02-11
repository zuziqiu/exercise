var webpack = require("webpack");
module.exports = {
    // devtool: 'eval-source-map',
    watch: true, // 监听打包
    entry: "./hello.js", //已多次提及的唯一入口文件
    // entry: __dirname + "./hello.js",//已多次提及的唯一入口文件
    output: {
        //打包后的文件存放的地方     __dirname：当前文件夹 
        path: __dirname,
        //打包后输出文件的文件名 
        filename: "main.js"
    },
    module: {
        rules: [{
                test: /\.json$/,
                use: 'json-loader'
            },
            {
                test: /\.css$/,
                use: "style-loader"
            },
            {
                test: /\.css$/,
                use: "css-loader"
            }
        ]
    }
}