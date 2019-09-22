module.exports = function(app) {
    app.directive('bandInfo', function(bandList){
        return {
            //option 1: inline --> template: '<h1 ng-repeat="band in bands">{{band.name}} - {{band.year}}</h1>',
            //option 2: absolute path to partials (which must be in public directory!) --> templateUrl: '/partials/band-info.html',
            //option 3:
            template: require('./band-info.html'),  //big advantage b/c it lets us use a relative url!!!
            restrict: 'E',
            controller: function($scope){
                $scope.bands = bandList;
            }
        };
    });
};