(function() {
   require("./countryPicker.css");

   var countryPickerController = function($scope, dataFactory) {
      var vm = this;

      vm.init = init;
      vm.selectedOption = '';
      vm.countries = [];
      vm.refreshOptions = refreshOptions;
      vm.selectedOptionChanged = selectedOptionChanged;

      vm.init();

      function init() {
        //vm.countries = vm.countrydata;
        // var successFunc = function(response) {
        //   //TODO: cache
        //   vm.countries=response.data;
        // };
        // var errFunc = function(response) {
        //   console.log('unable to fetch country data');
        // };

        // //fetch countries 
        // dataFactory.getCountries().then(successFunc,errFunc);
      }

      function refreshOptions(searchStr) {
        return;
      }

      function selectedOptionChanged() {
        vm.selectionChanged();
      }
   };

   countryPickerController.$inject = ['$scope','dataFactory'];

   var countryPickerFunc = function ($parse) {
      return {
         restrict: 'E',
         //replace: true,
         //transclude: false,
         controller: countryPickerController,
         controllerAs: 'vm',
         bindToController: true,
         template: require("./countryPicker.html"),
         scope: {
            //name: '@'    //Used to pass a string value into the directive
            //name: '='    //2 way binding
            //action: '&'  //Allows an external function to be passed into the directive and invoked
            label: '@label',
            selectedValue: '=ngModel',
            placeholder: '@placeholder',
            countrydata: '=',
            selectionChanged: '&'
         },
         link: function(scope, element, attrs) {
          scope.$watch('vm.countrydata', function(cdata) {
             scope.vm.countries = cdata;
          });
         }
       };
   };

    countryPickerFunc.$inject = ['$parse'];
    angular.module('app').directive('countryPicker', countryPickerFunc);
})();
