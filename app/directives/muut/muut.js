//TODO: wrap setup logic from setupMUUT here so that you can reuse across site
// (function() {
//     global.jQuery = require('jquery');
//     require('../../../resources/vendors/muut/js/moot.min.js');
//     require('../../../resources/vendors/muut/css/moot.css');
    
//      var mootFunc = function () {
//         return {
//             restrict: 'E',
//             link: function(scope,element, attrs, ctrl) {
//                 var config = {
//                     url: attrs.url,
//                     title: 'TEST TITLE!!!',
//                     channel: 'What is this channel for???',
//                     show_online: true,
//                     upload: false
//                 };
//             	//$(element).append('<a data-show_title="true" data-skip_truncate="true" href="'+attrs.url+'">Community</a>');
//             	$(element).muut(config);
//             }

//         };
//      };

//     mootFunc.$inject = [];
//     angular.module('app').directive('moot', mootFunc);
// })();