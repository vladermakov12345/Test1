// (function() {
// 	//require("./hotelSearchRooms.less");

//     var hotelSearchRoomsController = function() {
        
//         var vm = this;
//         vm.rooms = [1,2,3,4];

//         vm.init = init;
//         vm.setRoomNum = setRoomNum;

//         vm.init();

//         function init() {
//         }

//         function setRoomNum(entry) {
//             vm.selectedValue = entry;
//             vm.selectedValueChanged();
//         }

//         vm.selectedValueChanged = function () {
//             if (typeof vm.onChange === 'function') {
//                 vm.onChange(vm.selectedValue);
//             }
//         };
//     };

//     hotelSearchRoomsController.$inject = [];

//     var hotelSearchRoomsFunc = function ($state) {
//         return {
//         	restrict: 'E',
//             controller: hotelSearchRoomsController,
//             controllerAs: 'vm',
//             bindToController: true,
// 		    template: require("./hotelSearchRooms.html"),
//             scope: {
//                 selectedValue: '=ngModel',
//                 onChange: '=onChange'
//             },
// 		    link: function(scope, element, attrs) {

// 		    }
//         };
//     };

//     hotelSearchRoomsFunc.$inject = ['$state'];
//     angular.module('app').directive('hotelSearchRooms', hotelSearchRoomsFunc);
// })();

//     