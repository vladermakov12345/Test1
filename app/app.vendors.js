// Require the polyfill before requiring any other modules.
require('intersection-observer');

//adding here as a comment so that you are reminded that you do NOT need this
require('jquery');
require('jquery-ui');
require('jquery-easing');

require('angular');

//require("bootstrap");   //require("bootstrap-webpack");   //min?
require('bootstrap/dist/css/bootstrap.min.css');
require('bootstrap/dist/js/bootstrap.min.js');
require('angular-ui-bootstrap');    //https://www.npmjs.com/package/angular-ui-bootstrap
require('bootstrap-slider/dist/bootstrap-slider.min.js');
require('bootstrap-slider/dist/css/bootstrap-slider.min.css');
//require('bootstrap-slider');

//require("font-awesome/css/font-awesome.min.css");
require("font-awesome-webpack!../node_modules/font-awesome-webpack/font-awesome.config.js");   //require('font-awesome-webpack');
require('../resources/vendors/animate/js/animate.js');  //min?
require('../resources/vendors/animate/css/animate.css');  //min?

// //muut
// require('../resources/vendors/muut/js/moot.min.js');
// require('../resources/vendors/muut/css/moot.css');

//angular dependencies
require('angular-ui-router');       //https://github.com/angular-ui/ui-router
require('selection-model');         //https://www.npmjs.com/package/selection-model

//require('./shared/ui-bootstrap-2.5.0.min.js');
require('angular-animate');
require('angular-aria');
require('angular-messages');
require('slick-carousel');
require('angular-sanitize');
require('angular-modal-service');   //http://www.dwmkerr.com/the-only-angularjs-modal-service-youll-ever-need/
require('angular-cookies');

/************** UPDATING NOTES ********************/
require('ui-select');	//select2 adopted for angular
//THIS MAY NOT BE TRUE: if you update this, you'll need to remove the tabindexes from select.js for the bootstrap b/c they are set to -1!!!!!!!!!!!!!
/**************************************************/

require('ngmap');
//require('../resources/vendors/bootstrapRangeSlider/range-slider.js');

require('angularjs-nouislider');
require('nouislider/distribute/nouislider.min.css');

//maybe we'll add some of this back in later:
//require('../resources/vendors/artificialreason/css/lightbox.css'); //min?
//require('../resources/vendors/syntaxhighlighter/shCore.css');  //min?
//require('../resources/vendors/artificialreason/css/width-full.css'); //min?
//require('../resources/vendors/artificialreason/css/buttons.css'); //min?
//require('../resources/vendors/artificialreason/css/impl.css'); //min?
//require('../resources/vendors/artificialreason/js/slidebars.js');  //min?
//require('../resources/vendors/artificialreason/css/style-blue2.less'); //min?
//require('../resources/vendors/bootstrapStarRating/css/star-rating.css');
//require('../resources/vendors/bootstrapStarRating/js/star-rating.js');

//not sure if we will need this:
//<script src="http://ajax.googleapis.com/ajax/libs/jqueryui/1.10.3/jquery-ui.min.js"></script>   <!-- added for tooltip -->

//auth0 dependencies
require('auth0-js');
require('angular-auth0/src');
require('angular-jwt');

