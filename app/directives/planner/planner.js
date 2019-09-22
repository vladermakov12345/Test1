(function () {
    require("./planner.less");

    var plannerController = function ($state, $scope) {
        var vm = this;
        vm.init = init;
        vm.GetCityObject = GetCityObject;
        //vm.updateType = updateType;
        vm.selectedCity = '';
        vm.selectedDirectory = '';
        vm.selectedCityChanged = selectedCityChanged;

        vm.isSelectedAttractions = isSelectedAttractions;
        vm.isSelectedItineraries = isSelectedItineraries;
        vm.isSelectedCaregivers = isSelectedCaregivers;
        vm.isSelectedTransportation = isSelectedTransportation;
        vm.isSelectedTourCompanies = isSelectedTourCompanies;
        vm.isSelectedEquipmentRental = isSelectedEquipmentRental;

        vm.directoryTypes = [];
        vm.onChangeDirectoryType = onChangeDirectoryType;

        //initialization
        vm.init();

        //required
        vm.image_homePlannerCompass = require("../../../resources/img/home/home_planner_compass.png");
        vm.image_tourCompanies = require("../../../resources/img/planner/tour_companies.png");
        vm.image_transportation = require("../../../resources/img/planner/transportation.png");
        vm.image_attractions = require("../../../resources/img/planner/attractions.png");
        vm.image_caregivers = require("../../../resources/img/planner/caregivers.png");
        vm.image_equiptmentRental = require("../../../resources/img/planner/equipment_rental.png");
        vm.image_itineraries = require("../../../resources/img/planner/itineraries.png");

        //function definitions
        function init() {
            //check for incoming city
            if (vm.city) {
                vm.selectedCity = vm.GetCityObject(vm.city);
            }

            //this is needed for city page
            $scope.$watch('planner.city', function (a, b) {
                if (!vm.city) return;
                vm.selectedCity = vm.GetCityObject(vm.city);
            });


            //check for incoming type
            if (vm.type) {
                vm.selectedDirectory = vm.type;
            }
            //this is needed for city page
            $scope.$watch('planner.type', function (a, b) {
                if (!vm.type) return;
                vm.selectedDirectory = vm.type;

            });

            // vm.directoryTypes = [
            //     { key: 'Attractions', text: 'Attractions' },
            //     { key: 'Itineraries', text: 'Itineraries' },
            //     { key: 'Caregiver_Agencies', text: 'Caregiver Agencies ' },
            //     { key: 'Transportation', text: 'Transportation' },
            //     { key: 'Tour_Companies', text: 'Tour Companies' },
            //     { key: 'Equipment_Rental', text: 'Equipment Rental' }
            // ];
            vm.directoryTypes = [
                'Attractions', 'Itineraries', 'Caregiver Agencies', 'Transportation', 'Tour Companies', 'Equipment Rental'
            ];

        }

        //this is needed for the trip Resources page
        $scope.$watch('planner.cityoptions', function (a, b) {
            if (!vm.city) return;
            vm.selectedCity = vm.GetCityObject(vm.city);
        });

        //handle updates of city
        function selectedCityChanged() {
            if (vm.istripplannerpage) {
                $state.go('tripPlanner', { city: vm.selectedCity.Name.replace(' ', '_'), type: vm.type.replace(' ', '_') });
            }

            vm.city = vm.selectedCity.Name;

            // if (!vm.selectedCity) {
            //     vm.city = '';
            // } else {
            //     vm.city = vm.selectedCity.Name;
            // }
        }

        //handle updates of type
        // function updateType(newtype) {
        //     if (!vm.istripplannerpage) {
        //         $state.go('tripPlanner', {type: newtype, city: vm.selectedCity.Name});
        //     } else {
        //         vm.selectedDirectory = newtype;
        //         vm.type = newtype;
        //     }
        // }

        function onChangeDirectoryType() {
            $state.go('tripPlanner', { city: vm.selectedCity.Name.replace(' ', '_'), type: vm.selectedDirectory.replace(' ', '_'), category: '' });
        }

        function isSelectedAttractions() {
            return vm.selectedDirectory == 'Attractions';
        }
        function isSelectedItineraries() {
            return vm.selectedDirectory == 'Itineraries';
        }
        function isSelectedCaregivers() {
            return vm.selectedDirectory == 'Caregiver Agencies';
        }
        function isSelectedTransportation() {
            return vm.selectedDirectory == 'Transportation';
        }
        function isSelectedTourCompanies() {
            return vm.selectedDirectory == 'Tour Companies';
        }
        function isSelectedEquipmentRental() {
            return vm.selectedDirectory == 'Equipment Rental';
        }

        function GetCityObject(cityName) {
            if (!vm.cityoptions) return;
            for (var i = 0; i < vm.cityoptions.length; i++) {
                if (vm.cityoptions[i].Name == cityName)
                    return vm.cityoptions[i];
            }
        }
    };

    plannerController.$inject = ['$state', '$scope'];

    var tripPlanerFunc = function (dataFactory, $state) {
        return {
            restrict: 'E',
            scope: {
                name: '@',
                city: "=?",
                type: "=",
                cityoptions: '=',
                objSelectedProps: "=ngModel",
                istripplannerpage: "="
            },
            controller: plannerController,
            controllerAs: 'planner',
            bindToController: true,
            template: require("./planner.html"),
            link: function (scope, element, attrs) {
                scope.objSelectedProps = scope.planner.type;
                scope.type = scope.planner.type;
                scope.city = scope.planner.city;
            }
        };
    };

    tripPlanerFunc.$inject = ['dataFactory', '$state'];
    angular.module('app').directive('tripPlanner', tripPlanerFunc);
})();

