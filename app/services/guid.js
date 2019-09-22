module.exports = function(mod){
    var guidFactoryFunc = function () {

        var s4 = function() {
            return Math.floor((1 + Math.random()) * 0x10000)
              .toString(16)
              .substring(1);
        };

        return {
            get: function() {
                return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
            },
            isGuid: function(str) {
                var pattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
                return (pattern.test(str) === true);
            }
        };
	};

    guidFactoryFunc.$inject = [];
    mod.factory('guid', guidFactoryFunc);
};