angular.module('app').directive('ngFileModel', ['$parse', function ($parse) {
  return {
      restrict: 'A',
      link: function (scope, element, attrs) {
          var model = $parse(attrs.ngFileModel);
          var isMultiple = attrs.multiple;
          var modelSetter = model.assign;
          element.bind('change', function () {
              var values = [];
              var blobVal;
              angular.forEach(element[0].files, function (item) {
                  var reader = new FileReader();
                  reader.onload = function(loadEvent) {
                      // scope.$apply(function() {debugger;
                          blobVal = loadEvent.target.result;
                      // });
                      var value = {
                          // File Name 
                           name: item.name,
                           //File Size 
                           size: item.size,
                           //File URL to view 
                           url: URL.createObjectURL(item),
                           // File Input Value 
                           _file: item,
                           //binary
                           blb:blobVal
                       };
                       values.push(value);
                       scope.$apply(function () {
                          if (isMultiple) {
                              modelSetter(scope, values);
                          } else {
                              modelSetter(scope, values[0]);
                          }
                      });
                    };
                    reader.readAsDataURL(item);
                    
              });
             
          });
      }
  };
}]);