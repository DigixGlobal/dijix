/* eslint-disable import/no-extraneous-dependencies */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: [
    'babel-polyfill',
    'mocha-loader!./test/index.js',
    'mocha-loader!./test/ipfs.js',
  ],
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'testDist'),
  },
  module: {
    rules: [{
      test: /\.jpe?g$|\.gif$|\.png$|\.eot$|\.svg$/,
      loader: 'file-loader',
    }, {
      test: /\.js?$/,
      loader: 'babel-loader',
      exclude: '/node_modules/',
      include: [
        path.resolve(__dirname, './test/'),
        path.resolve(__dirname, './src/'),
      ],
    }],
  },
  plugins: [
    new HtmlWebpackPlugin({ title: 'TEST: Dijix' }),
  ],
  devServer: {
    contentBase: './testDist',
  },
  node: {
    fs: 'empty',
  },
};
