module.exports = function(app,EXIF){

    
    var imageOnLoadFunc = function() {
        return {
            restrict: 'A',
            link: function(scope, element, attrs) {
                element.bind('load', function() {

                    scope.$apply(checkOrientation(element));

                    //success call back?
                    if (attrs.imageCheckComplete) {
                        scope.$apply(attrs.imageCheckComplete)(true);
                    }
                });
                element.bind('error', function(){
                    console.warn('image could not be loaded');

                    //error call back?
                    if (attrs.imageCheckComplete) {
                        scope.$apply(attrs.imageCheckComplete)(false);
                    }
                });
            }
        };

        function checkOrientation(element) {
            
            var img1 = element[0];  //document.getElementById("example1");
            EXIF.getData(img1, function() {
                var orientation = EXIF.getTag(this, "Orientation");
                reOrient(parseInt(orientation || 1, 10), element);
            });
        }

        function reOrient(orientation, element) {
            switch (orientation) {
                case 1:
                    // No action needed
                    break;
                case 2:
                    element.css({
                        '-moz-transform': 'scaleX(-1)',
                        '-o-transform': 'scaleX(-1)',
                        '-webkit-transform': 'scaleX(-1)',
                        'transform': 'scaleX(-1)',
                        'filter': 'FlipH',
                        '-ms-filter': "FlipH"
                    });
                    break;
                case 3:
                    element.css({
                        'transform': 'rotate(180deg)'
                    });
                    break;
                case 4:
                    element.css({
                        '-moz-transform': 'scaleX(-1)',
                        '-o-transform': 'scaleX(-1)',
                        '-webkit-transform': 'scaleX(-1)',
                        'transform': 'scaleX(-1) rotate(180deg)',
                        'filter': 'FlipH',
                        '-ms-filter': "FlipH"
                    });
                    break;
                case 5:
                    element.css({
                        '-moz-transform': 'scaleX(-1)',
                        '-o-transform': 'scaleX(-1)',
                        '-webkit-transform': 'scaleX(-1)',
                        'transform': 'scaleX(-1) rotate(90deg)',
                        'filter': 'FlipH',
                        '-ms-filter': "FlipH"
                    });
                    break;
                case 6:
                    element.css({
                        'transform': 'rotate(90deg)'
                    });
                    break;
                case 7:
                    element.css({
                        '-moz-transform': 'scaleX(-1)',
                        '-o-transform': 'scaleX(-1)',
                        '-webkit-transform': 'scaleX(-1)',
                        'transform': 'scaleX(-1) rotate(-90deg)',
                        'filter': 'FlipH',
                        '-ms-filter': "FlipH"
                    });
                    break;
                case 8:
                    element.css({
                        'transform': 'rotate(-90deg)'
                    });
                    break;
            }
        };
    };

    imageOnLoadFunc.$inject = [];
    app.directive('imageOnLoad', imageOnLoadFunc);
};
