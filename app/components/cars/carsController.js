module.exports = function (app) {
    var carsController = function ($rootScope, carSearchService, $stateParams, dataFactory, $state, $scope, $document, $timeout,environmentService) {
        require('./cars.less');

        var vm = this;
        vm.env = environmentService();

        vm.errs = [];
        vm.searchCars = searchCars;
        vm.submitSearch = submitSearch;
        vm.requestContract = requestContract;
        vm.carSearchService = carSearchService;
        vm.filterCritearea = {};
        vm.selectedVehicleTypes = {};
        vm.selectedCarCompnies = {};
        vm.filterAirConditioning = false;
        vm.filterAutoTransmission = false;
        vm.filterCarTypeFilterAll = true;
        vm.filterCarCompaniesAll = true;
        vm.sortByPriceLowToHigh = true;
        vm.sortByPriceHighToLow = false;
        vm.filterCars = filterCars;
        vm.filterAllCarTypes = filterAllCarTypes;
        vm.filterAllCarCompanies = filterAllCarCompanies;
        vm.sortByPriceLowToHighCars = sortByPriceLowToHighCars;
        vm.sortByPriceHighToLowCars = sortByPriceHighToLowCars;
        vm.sortCars = sortCars;
        vm.pageChanged = pageChanged;
        vm.filterParams = {};
        vm.currentPage = 1;
        vm.pageSize = 25;
        vm.setupMetadata = setupMetadata;

        vm.moveToPickupDate = function () {
            $timeout(function () {
                angular.element('#cars_pickup_date').find('button').trigger('click');
            });
        };

        vm.moveToPickupTime = function () {
            $timeout(function () {
                angular.element('#cars_pickup_time').find('button').trigger('click');
            });
        };

        vm.moveToDropOffLocation = function () {
          $timeout(function () {
              angular.element('#cars_dropoff_location').find("input.ui-select-focusser").focus();
          });
        };

        vm.moveToDropOffDate = function () {
            $timeout(function () {
                angular.element('#cars_dropoff_date').find('button').trigger('click');
            });
        };

        vm.moveToDropOffTime = function () {
            $timeout(function () {
                angular.element('#cars_dropoff_time').find('button').trigger('click');
            });
        };

        vm.moveToSubmit = function () {
            $timeout(function () {
                angular.element('#car_search_submit').focus();
            });
        };

        function filterAllCarTypes() {
            if (vm.filterCarTypeFilterAll) {
                vm.selectedVehicleTypes = {};
            }
            vm.filterCars();
        }

        function filterAllCarCompanies() {
            if (vm.filterCarCompaniesAll) {
                vm.selectedCarCompnies = {};
            }
            vm.filterCars();
        }

        function sortByPriceLowToHighCars() {
            vm.sortByPriceHighToLow = false;
            sortCars();
        }

        function sortByPriceHighToLowCars() {
            vm.sortByPriceLowToHigh = false;
            sortCars();
        }
        
        function sortCars() {
            var sortOrder = vm.sortByPriceLowToHigh ? 'asc' : 'desc';
            vm.filterCarList = _.orderBy(vm.filterCarList, function(item) {
                return parseFloat(item.price_Details.display_price);
            }, [sortOrder]);
            vm.currentPage = 1;
            pageChanged();
        }

        function filterCars() {
            vm.filterParams.carType = [];
            vm.filterParams.carCompanies = [];
            _.each(vm.selectedVehicleTypes, function (value, key) {
                if (value) {
                    vm.filterParams.carType.push(key);
                }
            });
            _.each(vm.selectedCarCompnies, function (value, key) {
                if (value) {
                    vm.filterParams.carCompanies.push(key);
                }
            });
            if (vm.filterAirConditioning) {
                vm.filterParams.filterAirConditioning = true;
            } else {
                delete vm.filterParams.filterAirConditioning;
            }
            if (vm.filterAutoTransmission) {
                vm.filterParams.filterAutoTransmission = true;
            } else {
                delete vm.filterParams.filterAutoTransmission;
            }

            vm.filterCarTypeFilterAll = vm.filterParams.carType.length ? false : true;
            vm.filterCarCompaniesAll = vm.filterParams.carCompanies.length ? false : true;

            if(vm.filterParams.carType.length && vm.filterParams.carCompanies.length) {
                vm.filterCarList = _.filter(vm.carList, function (item) {
                    var condition1, condition2, condition3 = false;
                    condition1 = vm.filterParams.carType.includes(item.car.type) &&
                        vm.filterParams.carCompanies.includes(item.partner.name);
                    if (vm.filterParams.filterAirConditioning) {
                        condition2 = item.car.automatic_transmission;
                    }
                    if (vm.filterParams.filterAutoTransmission) {
                        condition3 = item.car.air_conditioning;
                    }
                    return condition1 || condition2 || condition3;
                });
            }
           else if(vm.filterParams.carType.length || vm.filterParams.carCompanies.length) {
                vm.filterCarList = _.filter(vm.carList, function (item) {
                    var condition1, condition2, condition3 = false;
                    condition1 = vm.filterParams.carType.includes(item.car.type) ||
                        vm.filterParams.carCompanies.includes(item.partner.name);
                    if (vm.filterParams.filterAirConditioning) {
                        condition2 = item.car.automatic_transmission;
                    }
                    if (vm.filterParams.filterAutoTransmission) {
                        condition3 = item.car.air_conditioning;
                    }
                    return condition1 || condition2 || condition3;
                });
            }
           else if (!vm.filterParams.carType.length && !vm.filterParams.carCompanies.length) {
                vm.filterCarList = _.filter(vm.carList, function (item) {
                    return true;
                });
            }
            sortCars();
            vm.currentPage = 1;
            pageChanged();

        }
        
        function pageChanged() {
            var startIndex = (vm.currentPage - 1) * vm.pageSize;
            var endIndex = startIndex + vm.pageSize;
            vm.displayCarList = vm.filterCarList.slice(startIndex, endIndex - 1);
            $document[0].body.scrollTop = $document[0].documentElement.scrollTop = 0;
        }

        vm.init = init;
        vm.displayMobileFilter = false;
        vm.editMode = false;
        vm.searchIsComplete = false;

        //events
        vm.showErrors = false;
        vm.searchInitiated = true;
        vm.isWaiting = false;
        
        vm.displayFilterData=false;

        vm.init();

        //ex: //http://localhost:82/api/cars/search?sid=12345&pickup_code=JFK&pickup_date=02/12/2018&pickup_time=10:00&dropoff_code=LGA&dropoff_date=2/16/2018&dropoff_time=1:00

        function init() {

            //sharing metadata
            vm.setupMetadata();

            //init service
            carSearchService.setParamsFromState($stateParams);

            //reset model from service
            vm.pickup_location = carSearchService.getPickUpLocation();
            vm.pickup_date = carSearchService.getPickUpDate();
            vm.pickup_time = carSearchService.getPickUpTime();
            vm.dropoff_location = carSearchService.getDropOffLocation();
            vm.dropoff_date = carSearchService.getDropOffDate();
            vm.dropoff_time = carSearchService.getDropOffTime();

            //valid so far?
            if (!carSearchService.hasValidParams()) {
                //-->errors are caught in the $scope.$watch below
                return;
            }

            //search
            vm.searchCars();
        }

        function setupMetadata() {
            var title = 'Reserve a car with accessibleGO';
            var desc = 'Get accessibility details and community reviews for hotels, flights and more!';
            var img = 'https://accessiblego.com' + require("../../../resources/img/cars/example.jpg");
            //var img = 'https://s1.pclncdn.com/rc-static/vehicles/partner/zr/size134x72/zeusifar999.jpg';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc,
                ogImage: img,
                twitterImage: img,
                breadcrumbJson: [{
                  type: 'ListItem',
                  position: 2,
                  name: 'Search Rental Cars',
                  item: 'https://accessibleGO.com/cars'
                }]
            });
        }

        function searchCars() {
            vm.errs = [];
            vm.showErrors = true;
            vm.isWaiting = true;
            vm.isButtonDisable=true;

            var sFunc = function (response) {
                vm.isWaiting = false;
                vm.searchIsComplete = true;
                vm.isButtonDisable=false;

                //ppn no availability errors
                if (response.data.errors && response.data.errors.length>0) {
                    var e = response.data.errors[0];
                    switch (e.code)
                    {
                        case '2.8121.50' : vm.errs.push("No rates were found."); break;
                        case '2.8121.51' : vm.errs.push("No results found having the searched pickup or drop off times. Please adjust your pickup or dropoff times and try again."); break;
                        case '2.8121.55' : vm.errs.push("No available cars found for this search."); break;
                        case '2.8121.56' : vm.errs.push("Invalid dropoff city search."); break;
                        case '2.8121.57' : vm.errs.push("Invalid pickup city."); break;
                    }

                    vm.carNotFound = true;
                    vm.editMode = true;
                    return;
                }

                var carList = response.data && response.data.data.results.result_list;
                vm.carList = carList.splice(0, 1000);
                console.log(vm.carList);
                vm.filterCarList = vm.carList;
                var carTypes = _.uniq(_.map(vm.carList, 'car.type'));
                vm.filterCritearea.carTypes = _.map(carTypes, function (type) {
                    var length = _.reject(vm.carList, function (item) {
                        return (item.car.type !== type);
                    }).length;
                    return {name: type, displayName: type.replace(/-/g, ' '), count: length};
                });
                var carCompanies = _.uniq(_.map(vm.carList, 'partner.name'));
                vm.filterCritearea.carCompanies = _.map(carCompanies, function (company) {
                    var length = _.reject(vm.carList, function (item) {
                        return (item.partner.name !== company);
                    }).length;
                    return {name: company, displayName: company, count: length};
                });
                vm.filterCritearea.autoTransmission = _.map(vm.carList, function (item) {
                    return item.car.automatic_transmission;
                });
                vm.filterCritearea.airConditioning = _.map(vm.carList, function (item) {
                    return item.car.air_conditioning;
                });
                vm.searchInitiated = true;
                sortCars();
                pageChanged();
            };

            var eFunc = function (response) {
                vm.isWaiting = false;
                vm.isButtonDisable=false;
            };

            var successFuncValidate = function (response) {
                //validation errors
                if (!response.data.IsValid) {
                    vm.errs = response.data.Errs;
                    vm.isWaiting = false;
                    vm.editMode = true;
                    vm.isButtonDisable=false;
                    return;
                }

                dataFactory.searchCars(carSearchService.params).then(sFunc, eFunc);
            };

            var errFuncValidate = function (response) {
                vm.errs.push('An error occurred while searching. please try again.');
                return;
            };

            dataFactory.validateSearchCars(carSearchService.params).then(successFuncValidate, errFuncValidate);
        }

        $scope.carSearchService = carSearchService;
        $scope.$watch('carSearchService.errs', function (newvalue) {
            vm.errs = newvalue;
            if(vm.errs.length>0){
                vm.isButtonDisable=false;
            }
            vm.editMode = true;
        }, true);

        //resets service from model, validates, and refreshes page
        function submitSearch() {
            vm.isButtonDisable=true;
            vm.errs = [];
            vm.showErrors = true;

            carSearchService.setParams(
            vm.pickup_location,
            vm.pickup_date,
            vm.pickup_time,
            vm.dropoff_location,
            vm.dropoff_date,
            vm.dropoff_time);

            if (vm.errs.length > 0) return;

            carSearchService.validateAndGo();
        }

        function requestContract(car_reference_id) {
            if (!car_reference_id) {
                console.log('no car reference id passed');
                return;
            }

            var contractRequestParams = {
                car_reference_id: car_reference_id
            };

            $state.go('reserveCar', contractRequestParams);
        }
    };

    carsController.$inject = ['$rootScope', 'carSearchService', '$stateParams', 'dataFactory', '$state', '$scope', '$document', '$timeout','environmentService'];
    app.controller('carsController', carsController);
};
