(function() {
   require("./lpwherePicker.css");

   var lpWherePickerController = function($scope, dataFactory) {
      var vm = this;

      vm.init = init;
      vm.selectedOption = '';
      vm.options = [];
      vm.appendHotels = appendHotels;
      vm.appendCities = appendCities;
      vm.appendAirports = appendAirports;
      vm.appendPois = appendPois;
      vm.refreshOptions = refreshOptions;
      vm.selectedOptionChanged = selectedOptionChanged;

      vm.init();

      function init() {
        //populate where-picker with previously searched city
        // var searchedCity = { city: 'New York', country: 'USA' };
        // vm.options = [searchedCity];
        // vm.selectedValue = searchedCity;
        //left off here - wherepicker accesses ppn city id here, so make call to get city name & country
      }

      vm.tagTransform = tagTransform;
      function tagTransform(newTag) {
        var item = {
            formatted_city: newTag,
        };

        return item;
      }


      function refreshOptions(searchStr) {
        //min characters
        if (searchStr.length<3) return;

        successFunc = function(response) {
          if (!response.data.data) return;
          if (!response.data.data.results) return;

          vm.options.length = 0;

          var data = response.data.data.results.result;

          if (vm.includeHotels ==='Y') {
            vm.appendHotels(data.hotels);  
          }
          vm.appendCities(data.cities, searchStr);
          vm.appendAirports(data.airports);
          //vm.appendPois(data.pois);
        };
        errFunc = function(response) {
          console.log('autosuggest error:');
          console.log(response);
        };
        dataFactory.autosuggest(searchStr).then(successFunc,errFunc);
      }
      
      function appendHotels(hotels) {
        if (!hotels) return;

        for (var i=0;i<hotels.length;i++) {
          var hotelDisplay = hotels[i].hotel_name;
          if (hotels[i].area_name) hotelDisplay+=' ('+hotels[i].area_name+')';

          var cityName = '';
          if (hotels[i].address.city_name) {
            cityName = hotels[i].address.city_name;
          }

          var stateCode = '';
          if (hotels[i].address.state_code) {
            stateCode = hotels[i].address.state_code;
          }

          vm.options.push({
            ppnid: hotels[i].hotelid_ppn,
            display: hotelDisplay,
            type: 'hotel',
            city: cityName,
            state: stateCode
          });
        }
      }

      function appendCities(cities,searchStr) {
        if (!cities) return;
        if (cities.length===0) return;

        var searchStrLCase = searchStr.toLowerCase();
        for (var i=0;i<cities.length;i++) {
          if (!cities[i].city.toLowerCase().startsWith(searchStrLCase)) {
              continue;
          }

          var cityDisplay = cities[i].city;
          if (cities[i].state) cityDisplay+=', '+cities[i].state;
          if (cities[i].country) cityDisplay+=', '+cities[i].country;

          vm.options.push({
            ppnid: cities[i].cityid_ppn,
            display: cityDisplay,
            type: 'city'
          });
        }
      }

      function appendAirports(airports) {
        if (!airports) return;

        for (var i=0;i<airports.length;i++) {
          var airportDisplay = airports[i].airport;
          if (airports[i].state_code) airportDisplay+=', '+airports[i].state_code;
          if (airports[i].country) airportDisplay+=', '+airports[i].country;

          vm.options.push({
            ppnid: airports[i].airport_id_ppn,
            display: airportDisplay,
            type: 'airport'
          });
        }
      }

      function appendPois(pois) {
        if (!pois) return;
        for (var i=0;i<pois.length;i++) {
          var poisDisplay = pois[i].poi_name;
          if (pois[i].country) poisDisplay+=', '+pois[i].country;
          vm.options.push({
            ppnid: pois[i].poiid_ppn,
            display: poisDisplay,
            type: 'poi'
          });
        }
      }

      function selectedOptionChanged() {}

   };

   lpWherePickerController.$inject = ['$scope','dataFactory'];

   var lpWherePickerFunc = function ($parse) {
      return {
         restrict: 'E',
         //replace: true,
         //transclude: false,
         controller: lpWherePickerController,
         controllerAs: 'vm',
         bindToController: true,
         template: require("./lpwherePicker.html"),
         scope: {
            //name: '@'    //Used to pass a string value into the directive
            //name: '='    //2 way binding
            //action: '&'  //Allows an external function to be passed into the directive and invoked
            includeHotels: '@includeHotels',
            label: '@label',
            selectedValue: '=ngModel',
            placeholder: '@placeholder'
         },
         link: function(scope, element, attrs) {
         }
       };   //return
   };   //wherePickerFunc

    lpWherePickerFunc.$inject = ['$parse'];
    angular.module('app').directive('lpWherePicker', lpWherePickerFunc);
})();
