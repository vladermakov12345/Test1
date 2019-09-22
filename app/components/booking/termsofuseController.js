module.exports = function(app) {
    var bookingTermsofuseController = function (dataFactory) {

        var vm = this;
        
        vm.block_data = ''; 
        vm.init = init;
        vm.getSubstitutes = getSubstitutes;
        vm.print = print;

        vm.init();

        function init() {
        	var successFunc = function(response) {
        		vm.block_data = response.data["getSharedPolicy.Car"].results.result.car_data.policy_data.policy_1.block_data;
        	};
        	var errFunc = function(err) {
        		console.log(err);
        	};
        	dataFactory.getCarPolicy().then(successFunc,errFunc);
        }

        function getSubstitutes(d) {
            return d.replace('{{ privacy_policy_url }}','/booking/privacypolicy');
        }


        function print(){
            window.print();
        }
    };

    bookingTermsofuseController.$inject = ['dataFactory'];
    app.controller('bookingTermsofuseController', bookingTermsofuseController);
};
