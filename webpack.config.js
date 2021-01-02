const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const webpack = require('webpack')
const dotenv = require('dotenv')
const WebpackAssetsManifest = require('webpack-assets-manifest')
const { CleanWebpackPlugin } = require('clean-webpack-plugin')

const noHash = ['sw']

module.exports = (env, { mode }) => ({
  mode: mode === 'production' ? 'production' : 'development',
  entry: { main: './src/index.tsx', sw: './src/sw.ts' },
  output: {
    filename: ({ chunk: { name } }) =>
      `[name]${noHash.includes(name) ? '' : '.[contenthash]'}.js`,
    path: path.resolve(__dirname, 'dist'),
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.js?$/,
        loader: 'babel-loader',
      },
      {
        test: /\.css$/i,
        use: [
          {
            loader: 'style-loader',
            options: {
              insert: 'head',
              injectType: 'singletonStyleTag',
            },
          },
          'css-loader',
        ],
      },
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    alias: {
      data: path.resolve(__dirname, 'data'),
    },
  },
  plugins: [
    new CleanWebpackPlugin(),
    new HtmlWebpackPlugin({
      template: './index.html',
      filename: 'index.html',
      inject: 'body',
    }),
    new webpack.DefinePlugin({
      'process.env': JSON.stringify({
        ...process.env,
        ...dotenv.config().parsed,
      }),
      'process.env.NODE_ENV': JSON.stringify(mode),
    }),
    new WebpackAssetsManifest(),
  ],
})
