(function() {
   require("./datePicker.css");

   var datePickerController = function($scope) {
      var vm = this;

      vm.init = init();

      function init() {
         //prevent Firefox et all from UI problems associated with vm.value = 'Invalid Date'
         if (!vm.value) {
            vm.value = null;
         }
      }

      $scope.clear = function() {
         vm.value = null;
      };

      $scope.dateOptions = {
         //customClass: getDayClass,
         dateDisabled: disabled,
         formatYear: 'yyyy',
         showWeeks: false,
         maxDate: new Date(2020, 5, 22),
         minDate: new Date(),
         initDate: new Date(),   //The initial date view when no model value is specified.
         startingDay: 1
      };

      //datepicker-mode="'month'"
      //format="MM/yyyy"
      //datepicker-options="{minMode: 'month'}"


      // Disable weekend selection
      function disabled(data) {
          var date = data.date,
          mode = data.mode;
          var todayFirstHour = new Date();
          todayFirstHour.setHours(0,0,0,0);
          return mode === 'day' && date < todayFirstHour;
          //for disabling weekends: && (date.getDay() === 0 || date.getDay() === 6);
      }

      $scope.open = function() {
         $scope.popup.opened = true;
         $scope.toggle = !$scope.toggl;
      };

      // $scope.open2 = function() {
      //    $scope.popup2.opened = true;
      // };

      $scope.setDate = function(year, month, day) {
         vm.value = new Date(year, month, day);
      };

      $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
      $scope.format = $scope.formats[3];
      $scope.altInputFormats = ['M!/d!/yyyy'];

      $scope.popup = {
         opened: false
      };

      // $scope.popup2 = {
      //    opened: false
      // };

      var tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      var afterTomorrow = new Date();
      afterTomorrow.setDate(tomorrow.getDate() + 1);

      $scope.events = [
         {
            date: tomorrow,
            status: 'full'
         },
         {
            date: afterTomorrow,
            status: 'partially'
         }
      ];

      function getDayClass(data) {
         var date = data.date,
         mode = data.mode;
         if (mode === 'day') {
            var dayToCheck = new Date(date).setHours(0,0,0,0);

            for (var i = 0; i < $scope.events.length; i++) {
               var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

               if (dayToCheck === currentDay) {
                  return $scope.events[i].status;
               }
            }
         }

         return '';
      }
      $scope.$watch('vm.minDate', function(newValue, oldValue, scope) {
         //exit if no new value
         if (!newValue) {
            return;
         }

         var newCheckoutDate = new Date(newValue.replace('"','').replace('"',''));

         //exit if check in value still before checkout value
         if (newCheckoutDate<scope.vm.value) {
            return;
         }

         //new checkout date should be 2 days after checkin
         newCheckoutDate.setDate(newCheckoutDate.getDate() + 2);

         //when would it be invalid?
         if (newCheckoutDate === 'Invalid Date') {
            return;
         }

         //set
         vm.value = newCheckoutDate;
      });

      $scope.$watch('vm.initOpen', function(newVal, oldVal, scope) {
         if (vm.initOpen==='true') {
            $scope.open();
         }
      })

      vm.selectedValueChange = function () {
         if (typeof vm.onChange === 'function') {
             vm.onChange(vm.value);
         }
      };
   };

   datePickerController.$inject = ['$scope'];

   var datePickerFunc = function ($parse) {
      return {
         restrict: 'E',
         controller: datePickerController,
         controllerAs: 'vm',
         bindToController: true,
         template: require("./datePicker.html"),
         scope: {
            //name: '@'    //Used to pass a string value into the directive
            //name: '='    //2 way binding
            //action: '&'  //Allows an external function to be passed into the directive and invoked
            id: '@id',
            label: '@label',
            minDate: '@minDate',
            value: '=ngModel',
            placeholder: '@placeholder',
            mode: '@mode',
            onChange: '=onChange',
            initOpen: '@initOpen'
         },
         link: function(scope, element, attrs) {
            //mode=month means only show month/year options
            if (attrs.mode === 'month') {
               scope.dateOptions = {
                  minMode: 'month',
                  datepickerMode: 'month',
                  formatYear: 'yyyy',
                  showWeeks: true
               };
               scope.format = 'MM/yyyy';
            }
         }
         //compile: function (element, attrs) {
            //var modelAccessor = $parse(attrs.ngModel);

            //var html = "<input type='text' id='" + attrs.id + "' ></input>";

            //var newElem = $(html);
            //element.replaceWith(newElem);

            // return function (scope, element, attrs, controller) {

            //    var processChange = function () {
            //       var date = new datepicker('dp1', 'date', true);
            //       date.showDlg();

            //       e.stopPropagation();
            //       //return false;

            //       //var date = new Date(element.datepicker("getDate"));

            //       scope.$apply(function (scope) {
            //          // Change bound variable
            //          modelAccessor.assign(scope, date);
            //       });
            //    };

            //    element.datepicker({
            //       inline: true,
            //       onClose: processChange,
            //       onSelect: processChange
            //    });

            //    scope.$watch(modelAccessor, function (val) {
            //       var date = new Date(val);
            //       element.datepicker("setDate", date);
            //    });

            // };
         //}  //compile
      };   //return
   };   //datePickerFunc

    datePickerFunc.$inject = ['$parse'];
    angular.module('app').directive('datePicker', datePickerFunc);
})();
