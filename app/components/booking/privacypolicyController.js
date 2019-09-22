module.exports = function(app) {
    var bookingPrivacypolicyController = function (dataFactory) {

        var vm = this;
        
        vm.block_data = ''; 
        vm.init = init;
        vm.getSubstitutes = getSubstitutes;
        vm.print = print;

        vm.init();

        function init() {
        	var successFunc = function(response) {
        		vm.block_data = response.data["getSharedPolicy.Car"].results.result.car_data.policy_data.policy_0;
        	};
        	var errFunc = function(err) {
        		console.log(err);
        	};
        	dataFactory.getCarPolicy().then(successFunc,errFunc);
        }

        function getSubstitutes(d) {
            return d.replace('{{ privacy_policy_url }}','/booking/termsofuse');
        }

        function print(){
            window.print();
        }
    };

    bookingPrivacypolicyController.$inject = ['dataFactory'];
    app.controller('bookingPrivacypolicyController', bookingPrivacypolicyController);
};
