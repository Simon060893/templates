/**
 * Created by Админ on 14.10.2017.
 */
'use strict';
const ENV_BUILD = {
    DEV: 'development',
    PROD: 'production',
    CUR: 'production'
};
// const NODE_ENV = process.env.NODE_ENV || ENV_BUILD.DEV;

const webpack = require('webpack');

module.exports =
{

    entry: "./src/app/js/webpack/test.webpack.js",
    output: {
        path: __dirname + "/dist",
        filename: "bundle.js",
        library: 'TWPACK'//export modyle in global namespace
    },
    watch: ENV_BUILD.CUR == ENV_BUILD.DEV,
    watchOptions: {
        aggregateTimeout: 100
    },
    devtool: ENV_BUILD.CUR == ENV_BUILD.DEV ? 'source-map' : false,
    plugins: [
        new webpack.NoEmitOnErrorsPlugin(),
        new webpack.DefinePlugin({
            NODE_ENV: JSON.stringify(ENV_BUILD.CUR)
        })
    ],
    resolve: {
        modules: ['node_modules'],
        extensions: ['.js']
    },
    resolveLoader: {
        modules: ['node_modules'],
        // moduleTemplates: ['*-loader', '*'],
        extensions: ['.js']
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    }
}
if (ENV_BUILD.CUR == ENV_BUILD.PROD) {
    module.exports.plugins.push(
        new webpack.optimize.UglifyJsPlugin(
            {
                compress: {
                    warnings: false,
                    drop_console: true,
                    unsafe: true
                }
            }
        )
    );
}
