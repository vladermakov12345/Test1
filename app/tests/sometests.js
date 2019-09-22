require("ng-file-upload");

(function() {
     var testsController = function ($scope, dataFactory) {
         var vm = this;
         vm.go = function() {
             dataFactory.test()
                 .then(function (response) {
                     console.log(response);
                     console.log(response.data.a);

                     var self = this;

                     //map is for calling a function once for each element in an array
                     //return response.data.map(function (item) {
                     //    return item.token;
                     //});
                 }, function (error) {
                     console.log('Unable to get token: ' + error.message);
                 });
         };
         vm.bad = 'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';
     };

     testsController.$inject = ['$scope','dataFactory'];
     angular.module('app').controller('testsController', testsController);

    var testsSubController = function ($scope) {

        //Include Css for SignUp/Forgot Password Model
        require("./index.less"); 

        var vm = this;
        testsController.apply(vm, arguments);

        vm.country = 'USA!';

        vm.parentBad = vm.bad;

        vm.setbad = function(){
            alert(vm.bad);
            alert(vm.parentBad);

            vm.bad='BBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBBB';
        };
    };

    testsSubController.$inject = ['$scope'];
    angular.module('app').controller('testsSubController', testsSubController);
})();

