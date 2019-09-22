module.exports = function(app){

	var testModalController = function($uibModal,loginModalService) {
		var vm = this;

		vm.openTravelersClub = function() {
		    var modalInstance = $uibModal.open({    //angular bootstrap modal
		        template: require("../../components/account/join/travelersClub.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
		        backdrop:'static',
		        keyboard: true,
		        size: 'lg'
		    });
		};

		vm.openLoginModalController = function() {
			loginModalService();
			// var modalInstance = $uibModal.open({    //angular bootstrap modal
		 //        template: require("../../components/account/login/loginModal.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
		 //        controller: 'loginModalController',
		 //        controllerAs: 'vm',
		 //        backdrop:'static',
		 //        keyboard: true,
		 //        size: 'md'
		 //    });
		}

		//set default params (this is an angular bootstrap modal)
            // var modalParams = {    
            //     template: require("../components/account/login/loginModal.html"), //'/web/dist/login.html',   //'/Template/RenderLoginTemplate'
            //         controller: 'loginModalController',
            //         controllerAs: 'vm',
            //         bindToController: true,
            //     backdrop:'static',
            //     keyboard: true,
            //     // inputs: {
            //     //     //TODO: create contact object and add fullname method on it
            //     //     title: 'Login'
            //     //     //recipient_fullname: contact.salutation+' '+contact.first+' '+contact.last,
            //     //     //recipient_email: contact.email
            //     // },
            //     size: 'md',
            //     resolve: {
            //         text: function() {
            //             return {};
            //         }
            //     }
            // };


	};

    testModalController.$inject = ['$uibModal','loginModalService'];
    app.controller('testModalController', testModalController);

};