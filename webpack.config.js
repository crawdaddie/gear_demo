var path = require('path');
var webpack = require('webpack');
var LiveReloadPlugin = require('webpack-livereload-plugin');

module.exports = {
    entry: './src/main.js',
    output: {
        path: path.resolve(__dirname, 'static/js'),
        filename: 'main.bundle.js'
    },
    plugins: [
        new LiveReloadPlugin()
    ],
    // module: {
    //     loaders: [
    //         {
    //             test: /\.js$/,
    //             loader: 'babel-loader',
    //             query: {
    //                 presets: ['es2015']
    //             }
    //         }
    //     ]
    // },
    stats: {
        colors: true
    },
    resolve: {
        extensions: [".ts", ".tsx", ".js"]
    },
    mode: 'development',
    devtool: 'source-map'
};