module.exports = function(mod){
    var cacheService = function ($cacheFactory) {

        var vm = this;

        vm.cache = $cacheFactory('agoCache');
        vm.keys = [];

        vm.init = init;
        vm.put = put;
        vm.get = get;
        vm.remove = remove;
        vm.containsKey = containsKey;
        vm.containsKeys = containsKeys;
        vm.getKeys = getKeys;

        function init() {
        }

        function put(cacheKey, cacheVal) {
            if (angular.isUndefined(vm.cache.get(cacheKey))) {
              vm.keys.push(cacheKey);
            }
            vm.cache.put(cacheKey, angular.isUndefined(cacheVal) ? null : cacheVal);
        }

        function get(cacheKey) {
            return vm.cache.get(cacheKey);
        }

        function remove(cacheKey) {
            vm.cache.remove(cacheKey);
        }

        function containsKey(cacheKey) {
            return vm.keys.indexOf(cacheKey) > -1;
        }

        function containsKeys(cacheKeys) {
            var c = true;
            cacheKeys.forEach(function(a) {
                if (!vm.containsKey(a)) {
                    c = false;
                }
            });
            return c;
        }

        function getKeys() {
            return vm.keys;
        }

	};

    cacheService.$inject = ['$cacheFactory'];
    mod.service('cacheService', cacheService);
};