// Generated using webpack-cli https://github.com/webpack/webpack-cli
const path = require('path');
const fs = require('fs');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const InlineSourceWebpackPlugin = require('inline-source-webpack-plugin');
const WebpackConcatPlugin = require('webpack-concat-files-plugin');
const WebpackShellPluginNext = require('webpack-shell-plugin-next');

const isProduction = process.env.NODE_ENV === 'production';
const packageJson = require('./package.json');
const dist = 'dist-wp'
const _compiled = '_compiled-wp'

const config = {
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, `${dist}`),
    publicPath: '/',
    filename: `bundle.js`,
    clean: true,
  },
  devServer: {
    port: 3000,
    open: ['/mdwiki.html'],
    static: [
      {
        directory: path.resolve(__dirname, `${dist}`),
      },
    ],
    watchFiles: [
      'src/js/*.js',
      'src/js/**/*.js',
      'src/ts/*.ts',
      'src/ts/*.tsx',
      'src/templates/*.hbs',
      'src/index.ejs',
    ],
  },
  plugins: [
    new WebpackShellPluginNext({
      onBuildStart: {
        scripts: [
          'echo-cli "Starting compilation of Typescript files."',
          `./node_modules/.bin/tsc --project src/ts/ --outfile src/${_compiled}/js/compiled_ts.js`,
          `echo-cli "Compilation of Typescript files is completed. File src/${_compiled}/js/compiled_ts.js is crėated."`,
          'echo-cli "Start to compile Handlebars templates"',
          `./node_modules/.bin/handlebars src/templates/**/*.hbs -r src/templates -f src/${_compiled}/js/compiled_templates.js`,
          'echo-cli "Compilation of Handlebars templates is completed!\n"',
        ],
        blocking: true,
        parallel: false
      },
    }),
    new HtmlWebpackPlugin({
      title: 'MDwiki',
      template: 'src/index.ejs',
      filename: 'mdwiki.html',
      xhtml: true,
      inject: false,
      templateParameters: {
        pkg: {
          ...packageJson,
          license: {
            name: packageJson.license,
            url: 'https://github.com/Dynalon/mdwiki/blob/master/LICENSE.txt',
          },
        },
        purpose: (isProduction ? 'release' : 'debugging'),
        isProduction,
        useLiveReload: false,
        fileRead: fs.readFileSync,
        fileList: { 
          cssMain: `./src/${_compiled}/css/main.css`,
          jsLibs: `./src/${_compiled}/js/concat_libs.js`,
          jsMain: `./src/${_compiled}/js/concat_js.js`,
        },
      },
    }),
    new WebpackConcatPlugin({
      bundles: [
        {
          src: [
            'node_modules/jquery/dist/jquery.js',
            'node_modules/bootstrap/js/affix.js',
            'node_modules/bootstrap/js/dropdown.js',
            'node_modules/handlebars/dist/handlebars.runtime.js',
            'node_modules/prismjs/prism.js',
            'node_modules/jquery-colorbox/jquery.colorbox.js',
          ],
          dest: `src/${_compiled}/js/concat_libs.js`,
        },
        {
          src: [
            'src/js/marked.js',
            'src/js/init.js',
            `src/${_compiled}/js/compiled_ts.js`,
            `src/${_compiled}/js/compiled_templates.js`,
            'src/js/main.js',
  
            // gimmicks
            'src/js/gimmicks/templating.js',
            'src/js/gimmicks/prism.js',
          ],
          dest: `src/${_compiled}/js/concat_js.js`,
        }
      ],
    }),
    new MiniCssExtractPlugin({
      filename: `../src/${_compiled}/css/main.css`,
    }),
    new InlineSourceWebpackPlugin({
      // compress: true,
      rootpath: './',
      noAssetMatch: 'warn'
    }),
    new CopyPlugin({
      patterns: [
        { from: 'src/assets', to: path.resolve(__dirname, `${dist}`) },
        { from: `src/${_compiled}/js/compiled_ts.js.map`, to: path.resolve(__dirname, `${dist}`) },
        // { from: 'dist', to: path.resolve(__dirname, 'release') },
      ],
    }),

    // Add your plugins here
    // Learn more about plugins from https://webpack.js.org/configuration/plugins/
  ],
  module: {
    rules: [
      {
        test: /\.(ts|tsx)$/i,
        loader: 'ts-loader',
        exclude: ['/node_modules/'],
      },
      {
        test: /\.css$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader'],
      },
      {
        test: /\.less$/i,
        use: [MiniCssExtractPlugin.loader, 'css-loader', 'less-loader'],
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2|png|jpg|gif)$/i,
        type: 'asset',
      },
      // Add your rules for custom modules here
      // Learn more about loaders from https://webpack.js.org/loaders/
    ],
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.jsx', '.js'],
  },
  experiments : { topLevelAwait: true },
};

module.exports = (env, argv) => {
  if (isProduction) {
    config.mode = 'production';
  } else {
    config.mode = 'development';
  }
  return config;
};
