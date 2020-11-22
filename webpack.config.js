'use strict';

let path = require('path');

module.exports = {
    entry: {
        'activate-power-mode': 'index'
    },
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js',
        //TODO 这里关系到在html里面如何使用发布的库
        libraryTarget: 'umd',
        library: 'POWERMODE'
    },
    resolve: {
        extensions: ['', '.js'],
        modulesDirectories: ['src', 'lib', 'node_modules']
    }
};