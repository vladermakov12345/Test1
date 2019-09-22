module.exports = function(app) {
    var cruisesController = function ($rootScope,$stateParams,$interval,$filter,dataFactory) {

        var vm = this;
        vm.cruiseData = [];
        vm.searchtext = '';
        vm.filteredResults = [];
        vm.init = init;
        vm.search = search;
        vm.updateResults = updateResults;
        vm.setEmail = setEmail;
        vm.unselectAll = unselectAll;
        vm.isAnythingChecked = isAnythingChecked;

        vm.init();

		require("./cruises.less");

		// force a $digest every ~1000ms
  		$interval(function () {}, 1000);

        function init() {

            //setup meta tags
            var title = 'Accessibility information for U.S. cruise lines';
            var desc = 'View accessibility details and contact information for U.S. cruise lines.';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                ogTitle: title,
                twitterTitle: title,
                metaDescription: desc,
                ogDescription: desc,
                twitterDescription: desc,
            });

            //get cruise data
            var successFunc = function (response) {
                vm.cruiseData = response.data.data;
                vm.filteredResults = vm.cruiseData;

                //incoming search text?
                if ($stateParams.phrase) {
                    vm.searchtext = $stateParams.phrase;

                    //do we need to call this or is ng-change triggering it?
                    vm.updateResults();
                }
            };
            var errFunc = function(response) {
                console.log('no cruise data found');
            };
        	dataFactory.getCruises().then(successFunc,errFunc);
        }

        function search() {

        }

        function updateResults() {
        	var phrase = vm.searchtext;
        	var filtered = $filter('filter')(vm.cruiseData, phrase);

            for (var i=0;i<vm.amenities.length;i++) {
                if (vm.amenities[i].checked) {

                    var newFilter = {};
                    newFilter[vm.amenities[i].key] = true;
                    
                    filtered = $filter('filter')(filtered, newFilter);  
                } 
            }

        	//if (vm.wheelchairAccessibleStaterooms) filtered = $filter('filter')(filtered, { WheelchairAccessibleStaterooms: true 	});
	        //if (vm.assistedBoardingAndDeparture) filtered = $filter('filter')(filtered, { AssistedBoardingAndDeparture: true });
	        // if (vm.wheelchairAccessibleRestroomsInPublicAreas) filtered = $filter('filter')(filtered, { WheelchairAccessibleRestroomsInPublicAreas: true });
	        // if (vm.accessibleShoreExcursions) filtered = $filter('filter')(filtered, { AccessibleShoreExcursions: true });
	        // if (vm.serviceAnimals) filtered = $filter('filter')(filtered, { ServiceAnimals: true });
	        // if (vm.equiptmentAvailable) filtered = $filter('filter')(filtered, { EquiptmentAvailable: true });
	        // if (vm.accessibilityConsultant) filtered = $filter('filter')(filtered, { AccessibilityConsultant: true });
	        // if (vm.poolLift) filtered = $filter('filter')(filtered, { PoolLift: true });
	        // if (vm.visualTactileAlertSystemInRoom) filtered = $filter('filter')(filtered, { VisualTactileAlertSystemInRoom: true });
	        // if (vm.assistiveListeningDevices) filtered = $filter('filter')(filtered, { AssistiveListeningDevices: true });
	        // if (vm.ttyAmplifiedPhones) filtered = $filter('filter')(filtered, { TTYAmplifiedPhones: true });
	        // if (vm.closedCaptionedTV) filtered = $filter('filter')(filtered, { ClosedCaptionedTV: true });
	        // if (vm.signLanguageInterpretingServices) filtered = $filter('filter')(filtered, { SignLanguageInterpretingServices: true });
	        // if (vm.orientationTour) filtered = $filter('filter')(filtered, { OrientationTour: true });
	        // if (vm.qualifiedReaders) filtered = $filter('filter')(filtered, { QualifiedReaders: true });
	        // if (vm.brailleTactileSignage) filtered = $filter('filter')(filtered, { BrailleTactileSignage: true });

			filtered = $filter('orderBy')(filtered, 'CruiseLine');
        	vm.filteredResults = filtered;
        }

        vm.amenities = [
            { key: 'WheelchairAccessibleStaterooms', name: 'Wheelchair Accessible Staterooms', checked: vm.WheelchairAccessibleStaterooms },
            { key: 'AssistedBoardingAndDeparture', name: 'Assisted Boarding and Departure', checked: vm.AssistedBoardingAndDeparture},
            { key: 'WheelchairAccessibleRestroomsInPublicAreas', name: 'Wheelchair Accessible Restrooms in Public Areas', checked: vm.WheelchairAccessibleRestroomsInPublicAreas},
            { key: 'AccessibleShoreExcursions', name: 'Accessible Shore Excursions', checked: vm.AccessibleShoreExcursions},
            { key: 'ServiceAnimals', name: 'Service Animals Welcome', checked: vm.ServiceAnimals},
            { key: 'EquiptmentAvailable', name: 'Equipment Available', checked: vm.EquiptmentAvailable},
            { key: 'AccessibilityConsultant', name: 'Accessibility Consultant Available on the Cruise', checked: vm.AccessibilityConsultant},
            { key: 'PoolLift', name: 'Pool Lift', checked: vm.PoolLift},
            { key: 'VisualTactileAlertSystemInRoom', name: 'Visual-Tactile Alert System in Room', checked: vm.VisualTactileAlertSystemInRoom},
            { key: 'AssistiveListeningDevices', name: 'Pagers or Assistive Listening Devices Available', checked: vm.AssistiveListeningDevices},
            { key: 'TTYAmplifiedPhones', name: 'TTY or Amplified Phones Available', checked: vm.TTYAmplifiedPhones},
            { key: 'ClosedCaptionedTV', name: 'Close Captioned TV available', checked: vm.ClosedCaptionedTV},
            { key: 'SignLanguageInterpretingServices', name: 'Sign Language Interpreting Services', checked: vm.SignLanguageInterpretingServices},
            { key: 'OrientationTour', name: 'Orientation Tour for the Vision Impaired', checked: vm.OrientationTour},
            { key: 'QualifiedReaders', name: 'Qualified Readers', checked: vm.QualifiedReaders},
            { key: 'BrailleTactileSignage', name: 'Braille/Tactile Signage', checked: vm.BrailleTactileSignage},
        ];

        function setEmail(text) {
            var clean = text.trim();
            if (clean.substring(0,4) == 'http') {
                return "<a href=" + clean + " target=\"_newWindow\">Contact</a>";
            } else {
                return "<a href=mailto:" + clean + ">" + clean + "</a>";
            }
            return text;
        }

        function unselectAll() {
            for (var i=0;i<vm.amenities.length;i++) {
                vm.amenities[i].checked = false;
            }
            vm.updateResults();
        }

        function isAnythingChecked() {
            for (var i=0;i<vm.amenities.length;i++) {
                if (vm.amenities[i].checked)
                    return true;
            }
        }

    };

    cruisesController.$inject = ['$rootScope','$stateParams','$interval','$filter','dataFactory'];
    app.controller('cruisesController', cruisesController);
};
