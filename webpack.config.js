//modules
const autoprefixer = require('autoprefixer');
const webpack = require('webpack');
const path = require('path');	//node module to help figure out paths (built in module inside node)
const precss = require('precss');

const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const HashedModuleIdsPlugin = require('webpack/lib/HashedModuleIdsPlugin');
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin");
const PolyfillInjectorPlugin = require('webpack-polyfill-injector');

var TimestampWebpackPlugin = require('timestamp-webpack-plugin');
var HtmlWebpackPlugin = require('html-webpack-plugin');
//var CopyWebpackPlugin = require('copy-webpack-plugin');
//var CleanWebpackPlugin = require('clean-webpack-plugin');

//common configuration
//var postcss       = require('postcss');

//process
var processEnv = process.env.npm_lifecycle_event;
console.log("processEnv: " + processEnv);

//environment group
var isDevEnv = true;
if (processEnv === 'staging') { isDevEnv = false; }
if (processEnv === 'production') { isDevEnv = false; }
console.log("isDevEnv: " + isDevEnv);

//development server port
var devServerPort = '';
if (processEnv === 'dev') { devServerPort = 3000; }
if (processEnv === 'frontonly') { devServerPort = 8080; }
console.log("devServerPort: " + devServerPort);

//entry base path
var entryBasePath = __dirname + '/app/';  //use entryBasePath for accessing assets
console.log("entryBasePath: " + entryBasePath);

//output path
var outputPath = path.resolve(__dirname, 'web');
console.log('output path: ' + outputPath);

//mode
var mode = isDevEnv?'development':'production';
console.log("mode: " + mode);

//dev tool (https://webpack.js.org/configuration/devtool/#special-cases)
var config_devtool = isDevEnv?'cheap-eval-source-map':'nosources-source-map';
console.log("config_devtool: " + config_devtool);

//TODO: what is stats.compilation.errors???

function recursiveIssuer(m) {
  if (m.issuer) {
    return recursiveIssuer(m.issuer);
  } else if (m.name) {
    return m.name;
  } else {
    return false;
  }
}

//config
var config = function() {

    var res = {
        mode: mode,
        devtool: config_devtool,
        context: path.resolve(__dirname, ''),

        // webpack-dev-server will monitor the code dependency of these entry points, and re-create the bundle when changes are detected.
        entry:
        {
            //each of these is called a chunk; aka bundle?
            //last one gets exported, which means?????

            //vendor: [entryBasePath + "app.vendors.js"],
            vendor: `webpack-polyfill-injector?${JSON.stringify({
                 modules: [entryBasePath + 'app.vendors.js']
            })}!`,

            //app: [entryBasePath + "app.js"]
            // services: `webpack-polyfill-injector?${JSON.stringify({
            //     modules: [entryBasePath + './services/app.services.js'] // list your entry modules for the `app` entry chunk
            // })}!`, // don't forget the trailing exclamation mark!
            

            //app: [entryBasePath + "app.js"]
            app: `webpack-polyfill-injector?${JSON.stringify({
                modules: [entryBasePath + 'app.js'] // list your entry modules for the `app` entry chunk
            })}!`//, // don't forget the trailing exclamation mark!

            // hotel: `webpack-polyfill-injector?${JSON.stringify({
            //     modules: [
            //         entryBasePath + './components/hotels/hotels.js',
            //         entryBasePath + './components/hotel/hotel.js',
            //         entryBasePath + './components/hotel/review/reviewHotel.js'
            //     ] // list your entry modules for the `app` entry chunk
            // })}!`
        },

        output: {
            path: outputPath,                   //disk location where files are written (w/o this, it would look at root)
            publicPath: '/web/',		        //path from view of page; uses webpack-dev-server in development
            filename: '[name].bundle.js',       //multiple output bundles; name of output file will match the key of entry object
            chunkFilename: '[name].bundle.js'   //Filename for non-entry chunk;
        },

        // webpack-dev-server configuration
        devServer: {
            contentBase: 'build',
            // stats: 'minimal',
            // compress: true,
            port: devServerPort,
            historyApiFallback: {
                index: '/web/', //go here for requests that do not map to an existing asset
                rewrites: [
                    { from: /\/soccer/, to: '/soccer.html' } //just an example - routes like /soccer/schedule or /soccer/games/123 would go to soccer.html
                ]
            },
            // 'Live-reloading' happens when you make changes to code dependency pointed to by 'entry' parameter explained earlier.
            // 'watchContentBase' makes live-reloading happen even when changes are made to the static html pages in 'contentBase'
            watchContentBase: true
        },
        plugins: [

            new HtmlWebpackPlugin({
                title: 'accessibleGO',
                filename: 'index.html',
                template: './index-new.html',
                inject: 'body',
                chunks: ['app','vendor'],
                hash: true, //append a unique webpack compilation hash, useful for cache busting
                xhtml: true
            }),

            //new webpack.HashedModuleIdsPlugin(), // so that file hashes don't change unexpectedly

            //-- WEBPACK 4 --
            new MiniCssExtractPlugin({
                filename: '[name].bundle.css?[hash:8]', //isTestEnv ? '[name].bundle.css' : '[name].bundle.css?[hash:5]',
                chunkFilename: '[id].bundle.css?[hash:8]'   // isTestEnv ? '[id].bundle.css' : '[id].bundle.css?[hash:5]'
            }),

            // OLD
            // new ExtractTextPlugin({
            //     filename: '[name].bundle.css?[hash:5]',
            //     allChunks: true
            //}),

            // new CommonsPlugin({
            //     minChunks: 2,   //if any module is used X or more times, then take it out and pull it into the common chunky
            //     names: ["app", "vendor"],
            //     filename: (!isTestEnv)
            //         ? '[name].bundle.js?[hash:5]' // chunkhash increases compilation time so don't use in dev
            //         : '[name].bundle.js?[hash:5]'
            // }),


            new webpack.ProvidePlugin({
                $: 'jquery',
                jQuery: 'jquery',
                'window.jQuery': 'jquery',
                dateFns: 'date-fns',
                _map: ['lodash', 'map'],

                //newly added during this webpack 4 craze
                Alert: 'exports-loader?Alert!bootstrap/js/dist/alert',
                Button: 'exports-loader?Button!bootstrap/js/dist/button',
                Carousel: 'exports-loader?Carousel!bootstrap/js/dist/carousel',
                Collapse: 'exports-loader?Collapse!bootstrap/js/dist/collapse',
                Dropdown: 'exports-loader?Dropdown!bootstrap/js/dist/dropdown',
                Modal: 'exports-loader?Modal!bootstrap/js/dist/modal',
                Popover: 'exports-loader?Popover!bootstrap/js/dist/popover',
                Scrollspy: 'exports-loader?Scrollspy!bootstrap/js/dist/scrollspy',
                Tab: 'exports-loader?Tab!bootstrap/js/dist/tab',
                Tooltip: "exports-loader?Tooltip!bootstrap/js/dist/tooltip",
                Util: 'exports-loader?Util!bootstrap/js/dist/util',
                noUiSlider: 'nouislider'
            }),

            // new CleanWebpackPlugin(outputPath, {
            //     verbose: true,
            //     dry: false
            // }),

            //custom plugin: add a banner in the resulting bundle.js file
            new webpack.BannerPlugin("**********\nGenerated: " + new Date() + "\n****************\n"),

            // new TimestampWebpackPlugin({
            //     path: __dirname,
            //     filename: 'last-deploy-ts.json'
            // }),
            
            // webpack 3 changes
            // new webpack.optimize.OccurenceOrderPlugin(true),
            new webpack.optimize.OccurrenceOrderPlugin(true),

            // new webpack.DefinePlugin({
            //     'process.env': {
            //         'BASEURL_CONTENT': JSON.stringify(BASEURL_CONTENT),
            //         'BASEURL_CRM': JSON.stringify(BASEURL_CRM),
            //         'BASEURL_PRICELINE': JSON.stringify(BASEURL_PRICELINE),
            //         'auth0_spa_clientId': JSON.stringify(auth0_spa_clientId),
            //         'auth0_redir_base': JSON.stringify(auth0_redir_base),
            //     }
            // }),

            new PolyfillInjectorPlugin({
                polyfills: [
                    'Promise',
                    'Array.prototype.find',
                ]
            })
        ],
        resolveLoader: {
            moduleExtensions: ["-loader"]
        },

        //WEBPACK 4
        optimization: {
            namedModules: true, // NamedModulesPlugin()
            //runtimeChunk: 'single',
            noEmitOnErrors: true, // NoEmitOnErrorsPlugin
            concatenateModules: true, //ModuleConcatenationPlugin
            splitChunks: {
                //chunks: 'all',
                //maxInitialRequests: Infinity,   //webpack default is 3 files
                //minSize: 0, //webpack default is 30kb
                cacheGroups: {  //define rules for how Webpack should group chunks into output files.
                    // vendor: {
                    //     test: /[\\/]node_modules[\\/]/,
                    //     name(module) {
                    //         // get the name. E.g. node_modules/packageName/not/this/part.js
                    //         // or node_modules/packageName
                    //         const packageName = module.context.match(/[\\/]node_modules[\\/](.*?)([\\/]|$)/)[1];

                    //         // npm package names are URL-safe, but some servers don't like @ symbols
                    //         return `npm.${packageName.replace('@', '')}`;
                    //     }
                    // }
                    vendorStyles: {
                        name: 'vendor',
                        test: (m,c,entry = 'vendor') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
                        chunks: 'all',
                        enforce: false
                    },
                    // servicesStyles: {
                    //     name: 'app',
                    //     test: (m,c,entry = 'services') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
                    //     chunks: 'all',
                    //     enforce: false
                    // },
                    appStyles: {
                        name: 'app',
                        test: (m,c,entry = 'app') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
                        chunks: 'all',
                        enforce: true,
                        reuseExistingChunk: true
                    }
                    // ,
                    // hotelStyles: {
                    //     name: 'hotel',
                    //     test: (m,c,entry = 'hotel') => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entry,
                    //     chunks: 'all',
                    //     enforce: true
                    // }
                }
            },
            minimizer: [
                new UglifyJsPlugin({
                    cache: true,
                    parallel: true,
                    sourceMap: true,    //isDevEnv, //cheap-source-map options don't work with this plugin.
                    test: /\.js(\?.*)?$/i,
                    exclude: [/\.min\.js$/gi],
                    uglifyOptions: {
                        warnings: false,
                        parse: {},
                        compress: {
                            sequences: true,
                            dead_code: true,
                            conditionals: true,
                            booleans: true,
                            unused: true,
                            if_return: true,
                            join_vars: true,
                            drop_console: true
                        },
                        mangle: true,  //false, // Note `mangle.properties` is `false` by default.
                        output: {
                            comments: false,
                            beautify: false
                        },
                        toplevel: false,
                        nameCache: null,
                        ie8: false,
                        keep_fnames: false,
                    }
                }),
                new OptimizeCSSAssetsPlugin({
                    cssProcessorOptions: {
                        zindex: false,
                    },
                    //filename: '[name].bundle.css?[hash:5]', // isTestEnv ? '[name].bundle.css' : '[name].bundle.css?[hash:5]',
                    //chunkFilename: '[id].bundle.css?[hash:5]'   // isTestEnv ? '[id].bundle.css' : '[id].bundle.css?[hash:5]'
                })
            ]
        },

        module: {

            //watch is not attribute not supported in webpack 3

            //watch: true,  //reruns build and creates output file

            //context not supported in webpack 3
            //sets relative root directory for the entry key
            // context: path.resolve('app'),
            wrappedContextCritical: true,

            //jshint not a attribute in webpack 3
            // jshint: {
            //     camelCase: true,
            //     emitErrors: false,
            //     failOnHint: false
            // },

            //Preloaders are moved inside the rules with enforce attribute in webpack 3

            // preLoaders: [
            //     {
            //         test: [ /\.js$/, "/css/"],
            //         exclude: [/node_modules/,/muut/],	//do not lint 3rd party code
            //         loader: "jshint-loader"
            //     }
            // ],

            rules: [

                //--- WEBPACK 4 ---

                //CSS EXTRACT
                {
                    test: /\.css$/,
                    use: [
                        MiniCssExtractPlugin.loader,
                        "css-loader"
                    ]
                    //include: [helpers.root('src', 'styles')]
                },


                //LESS LOADER
                {
                    test: /\.less$/,
                    use: [
                        //'style-loader' // creates style nodes from JS strings
                        MiniCssExtractPlugin.loader,
                        'css-loader', // translates CSS into CommonJS
                        'less-loader' // compiles Less to CSS
                    ]
                },

                // SASS LOADER
                {
                    test: /\.(sa|sc)ss$/,
                    use: [MiniCssExtractPlugin.loader, //'css-loader', 'postcss-loader', 'sass-loader'
                        { loader: 'css-loader', options: { importLoaders: 1 } },
                        { loader: 'postcss-loader' },
                        { loader: 'sass-loader' },
                    ],
                    //include: [helpers.root('src', 'styles')]
                },

                //ASSET LOADER
                {
                    test: /\.(png|jpg|jpeg|gif|woff)$/,
                    exclude: /node_modules/,
                    // loader: 'file-loader?name=public/resources/[name].[ext]?[hash:5]'
                    // use file-loader instead of file for webpack 3
                    use: [
                        'file-loader?name=public/resources/[name].[ext]?[hash:5]',
                        'image-webpack-loader?bypassOnDebug'
                    ]
                },
                {
                    test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    //exclude: /node_modules/,
                    // use url-loader instead of url for webpack 3
                    use: "url-loader?limit=10000&minetype=application/font-woff"
                },
                {
                    test: /\.(ttf|eot|svg)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                    // use file-loader instead of file for webpack 3
                    use: 'file-loader'
                },

                // custom loader: strip comments out of json
                {
                    test: /\.json$/,
                    exclude: /node_modules/,
                    use: "json-loader!" + path.resolve('loaders/strip')
                },

                // Bootstrap 4
                {
                  test: /bootstrap\/dist\/js\/umd\//, use: 'imports-loader?jQuery=jquery'
                },

                // font-awesome
                {
                    test: /font-awesome\.config\.js/,
                    use: [
                        { loader: 'style-loader' },
                        { loader: 'font-awesome-loader' }
                    ]
                },



//=-- previous junk --
//preloader changes
// {
//     test: [/\.js$/, "/css/"],
//     exclude: [/node_modules/, /muut/],	//do not lint 3rd party code
//     enforce: 'pre',
//     use: [{
//         loader: 'jshint-loader',
//         options: {
//             camelcase: false,
//             emitErrors: false,
//             failOnHint: false,
//             esversion: 6
//         }
//     }]
// },

                //html loader
                {
                    test: /\.html$/,
                    exclude: /node_modules/,
                    //webpack 3 changes
                    //loader:'raw'
                    use: [{
                        loader: 'raw-loader'
                    }]
                },

                //js loader
                {
                    test: /\.es6\.js$/,
                    include: path.resolve('app'),
                    use: {
                        loader: 'babel-loader',
                        options: {
                            presets: ['@babel/preset-env']
                        }
                    }
                    // use: [{
                    //     //use babel-loader instead of row in webpack 3
                    //     //loader:'babel'
                    //     loader: 'babel-loader',
                    //     use: {
                    //         presets: [
                    //             ['es2015', { "modules": false }]
                    //         ]
                    //     }
                    // }]
                },




            ]
        },

        
        resolve: {
            //first extension can't be null in webpack 3
            // extensions: ['','.js','.es6'],
            extensions: [".js", ".es6"],
            alias: {
                // bind version of jquery-ui
                //"jquery-ui": "jquery-ui", jquery-ui/jquery-ui.js
                "jquery-ui": "jquery-ui",
                modules: path.join(__dirname, "node_modules"),
                config: path.join(__dirname, 'config', '' + process.env.npm_lifecycle_event)
            }
        }
    };

    if (isDevEnv) {
        res.plugins.push(new webpack.HotModuleReplacementPlugin({multiStep:false}));
    }

    return res;
};

module.exports = config();