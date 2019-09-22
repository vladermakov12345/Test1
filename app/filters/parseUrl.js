module.exports = function(app) {
    var parseUrlFilter = function ($sce) {

        var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
        var urlText = /(link)/gim;
        var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
     
        return function(text) {
            if(!text) return;

            var coffee = '';
            if(text.match(urlText)) {
                coffee = text.replace(urlText, '$1');
            }

            if(text.match(urls)) {
                //var coffee = "something inside";
                text = text.replace(urls, '<a href="$1">$2</a>');
            }

            if(text.match(emails)) {
                text = text.replace(emails, '<a href=\"mailto:$1\">$1</a>');
            }
            return $sce.trustAsHtml(text);
        };

    };

    parseUrlFilter.$inject = ['$sce'];
    app.filter('parseUrlFilter', parseUrlFilter);
};

// (function() {
//     var parseUrlFilter = function ($sce) {
//         var urls = /(\b(https?|ftp):\/\/[A-Z0-9+&@#\/%?=~_|!:,.;-]*[-A-Z0-9+&@#\/%=~_|])/gim;
//         var emails = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
     
//         return function(text) {
//             if(text.match(urls)) {
//                 text = text.replace(urls, '<a href="$1">$1</a>');
//             }
//             if(text.match(emails)) {
//                 text = text.replace(emails, '<a href=\"mailto:$1\">$1</a>');
//             }
//             return $sce.trustAsHtml(text);
//         };
//     };

//     parseUrlFilter.$inject = ['$sce'];
//     angular.module('app').filter('parseUrlFilter', parseUrlFilter);
// })();