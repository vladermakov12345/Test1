module.exports = function(mod){
	var flightUtilities = function($uibModal) {

		var vm = this;
		vm.openModal = openModal;
        vm.setupModal = setupModal;

        // this.getUrlSafeDate = function(date) {
        //     if (!date) return null;
        //     return (date.getMonth() + 1) + "-" + date.getDate() + "-" + date.getFullYear();
        // };

        function openModal(template, controller, content) {
            var instance = $uibModal.open({
                template: template,
                controller: controller,
                controllerAs: 'vm',
                bindToController: true,
                animation: false,
                ariaLabelledBy: 'modal-title',
                ariaDescribedBy: 'modal-body',
                backdrop: 'static',
                keyboard: true,
                size: 'lg',
                resolve: {
                    items: function () {
                        return content;
                    }
                }
            });
            if (content.callbackFunc) return instance.result.then(content.callbackFunc);
            return instance.result.then(vm.notyetsure);
        }

        function setupModal(obj) {

            //extract policy title
            var title = obj.title;

            //extract policy text
            var text = '';
            $.each(obj.paragraph_data, function(idx,val) {
                text += '<p>'+val+'</p>';
            });

            //display in modal
            var template = require("../../components/modal/modal.html");
            vm.openModal(template, 'modalController', {
                title: title,
                text: text,
                closeOnTop: 'y'
            });
        }

	};

    flightUtilities.$inject = ['$uibModal'];
    mod.service('flightUtilities', flightUtilities);
};