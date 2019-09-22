module.exports = function(app){

  var hideUntilGoodFunc = function() {
    return {
      restrict: 'A',
      multiElement: true,
      link: function(scope, element, attrs) {
        attrs.$observe('ngSrc', function (value) {
          // fix where ngSrc doesn't update when blank
          if (!value || value.length == 0) {
            //var tranpix = 'data:image/png;base64, iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII='
            element.attr('src', value);
          }
          element.css("display", "none");
        });
        element.bind('load', function() {
          element.css("display", "");
        });
      }
    };
  };

  hideUntilGoodFunc.$inject = [];
  app.directive('hideUntilGood', hideUntilGoodFunc);
};