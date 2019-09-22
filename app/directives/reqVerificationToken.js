//append the verification token which is checked in server side AntiForgeryValidateAttribute
//this direvtive is implemented a single time as ncg-request-verification-token in <body>
(function() {
    var ncgRequestVerificationToken = function ($http) {
        return function (scope, element, attrs) {
            $http.defaults.headers.common["X-XSRF-Token"] = attrs.ncgRequestVerificationToken || "no request verification token";
        };
    };

    ncgRequestVerificationToken.$inject = ['$http'];
    angular.module('app').directive('ncgRequestVerificationToken', ncgRequestVerificationToken);
})();