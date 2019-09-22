//forgot what a factory is: http://stackoverflow.com/questions/15666048/angularjs-service-vs-provider-vs-factory
module.exports = function(app) {
    app.factory('bandList', function(){
        return [
            { name: 'AAA', formed: 1975},
            { name: 'BBB', formed: 1935},
        ];
    });
};