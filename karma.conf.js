// Karma configuration
// Generated on Fri Sep 20 2019 05:49:36 GMT+0700 (Novosibirsk Standard Time)
var webpackConfig = require('./webpack.config.js');
//webpackConfig.entry = {};

module.exports = function(config) {
  config.set({

    // base path that will be used to resolve all patterns (eg. files, exclude)
    basePath: '',


    // frameworks to use
    // available frameworks: https://npmjs.org/browse/keyword/karma-adapter
    frameworks: ['jasmine','chai','detectBrowsers'],


    // list of files / patterns to load in the browser
    files: [
      //'./app/app.js',
//      './node_modules/angular-mocks/angular-mocks.js',    
	  './unitTests/**/*.js'
    ],


    // list of files / patterns to exclude
    exclude: [
    ],


    // preprocess matching files before serving them to the browser
    // available preprocessors: https://npmjs.org/browse/keyword/karma-preprocessor
    preprocessors: {
      './web/app.bundle.js': ['webpack'],  
      './web/vendor.bundle.js': ['webpack'],   
//      './unitTests/**/*.js': ['babel']        
      //'./app/app.js': ['webpack'],               
    },


    // test results reporter to use
    // possible values: 'dots', 'progress'
    // available reporters: https://npmjs.org/browse/keyword/karma-reporter
    reporters: ['progress'],


    // web server port
    port: 9876,


    // enable / disable colors in the output (reporters and logs)
    colors: true,


    // level of logging
    // possible values: config.LOG_DISABLE || config.LOG_ERROR || config.LOG_WARN || config.LOG_INFO || config.LOG_DEBUG
    logLevel: config.LOG_INFO,


    // enable / disable watching file and executing tests whenever any file changes
    autoWatch: true,


    // start these browsers
    // available browser launchers: https://npmjs.org/browse/keyword/karma-launcher
    browsers: ['Chrome'],


    // Continuous Integration mode
    // if true, Karma captures browsers, runs the tests and exits
    singleRun: true, 

    // Concurrency level
    // how many browser should be started simultaneous
    concurrency: Infinity,

    autoWatchBatchDelay: 300,  
    webpack: webpackConfig,

	detectBrowsers: {
	    enabled: true,
	    usePhantomJS: false
	},
    //webpackMiddleware: {
    //  noInfo: true
    //}
  })
}
