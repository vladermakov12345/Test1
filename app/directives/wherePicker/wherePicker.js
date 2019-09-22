(function() {
   require("./wherePicker.css");

   var wherePickerController = function($scope, $sce, $q, dataFactory, cacheService, localStorageService) {
      var vm = this;

      vm.init = init;
      vm.selectedOption = '';
      vm.options = [];
      vm.appendHotels = appendHotels;
      vm.appendCities = appendCities;
      vm.appendAirports = appendAirports;
      vm.appendPois = appendPois;
      vm.selectedOptionChanged = selectedOptionChanged;
      vm.maxToReturn = 35;

      //messaging
      vm.message = '';

      //search parameters
      vm.currentSearchParams = {};
      vm.previousSearchParams = {};

      //search
      vm.refreshOptions = refreshOptions;
      vm.updateUI = updateUI;

      //search state management
      vm.stateManager = {};
      vm.getStateManagerObject = getStateManagerObject;
      vm.InitStateManager = InitStateManager;

      //what to display
      // vm.showCities = false;
      // vm.showHotels = false;
      // vm.showAirports = false;
      // vm.showDirectories = false;

      //vm.cachedKey = 'ppn.data';

      //search results
      vm.matchingSet = [];

      vm.init();

      function init() {

        //set what to include
        //vm.showCities = vm.includeCities && vm.includeCities === 'Y';
        //vm.showHotels = vm.includeHotels && vm.includeHotels === 'Y';
        //vm.showAirports = vm.includeAirports && vm.includeAirports === 'Y';
        //vm.showDirectories = vm.includeDirectories && vm.includeDirectories === 'Y';

        //setup page scoped state management
        setTimeout( function() {
          vm.InitStateManager();
        }, 500 );

        //populate where-picker with previously searched city
        // var searchedCity = { city: 'New York', country: 'USA' };
        // vm.options = [searchedCity];
        // vm.selectedValue = searchedCity;
        //left off here - wherepicker accesses ppn city id here, so make call to get city name & country

        dataFactory.getAllAirports().then(function(res) {
          vm.allAirportData = res.data.results;
        });
        
      }

      vm.SetMessage = SetMessage;
      function SetMessage(message) {
        vm.message = message;
      }

      vm.getRandomId = getRandomId;

      function getRandomId() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return Math.random().toString(36).substr(2, 9);
      }

      function getStateManagerObject(dataTypeName, isInclude, cb) {
        return {
            baseKey: dataTypeName,
            title: this.baseKey,
            fetchesInProgress: [],
            key: function(f2) { return this.baseKey+'_'+f2; },
            isIncluded: function() {
              return isInclude && isInclude === 'Y';
            },
            isCached: function(f2) {
              return cacheService.containsKey(this.key(f2));
            },
            isFetchInProgress: function(f2) {
              for(var i=0;i<this.fetchesInProgress.length;i++) {
                if (this.fetchesInProgress[i].key === this.key(f2)) return true;
              }
              return false;
            },
            setFetchInProgress: function(id,f2) {
              this.fetchesInProgress.push({
                id: id,
                key: this.key(f2)
              });
              //console.log('putting fetch in progress: ' + this.key(f2) + ' at ' + new Date().getMilliseconds());
            },
            getFetchInProgressKey: function(id) {
              for (var c=0;c<this.fetchesInProgress.length;c++) {
                if (this.fetchesInProgress[c].id === id) {
                  return this.fetchesInProgress[c].key;
                }
              }
            },
            getFetchesInProgress: function() {
              return this.fetchesInProgress.length;
            },
            removeFetchInProgress: function(id) {
              for (var c=0;c<this.fetchesInProgress.length;c++) {
                if (this.fetchesInProgress[c].id === id) {
                  this.fetchesInProgress.splice(c,1);
                  return;
                }
              }
            },
            cb: cb
          };
      }

      function InitStateManager() {

        //var first2 = vm.currentSearchParams.f2();

        vm.stateManager = {
          lookups: {
            cities: vm.getStateManagerObject('cities', vm.includeCities),//, dataFactory.getAutosuggestCities),
            hotels: vm.getStateManagerObject('hotels', vm.includeHotels),//, dataFactory.getAutosuggestHotels),
            airports: vm.getStateManagerObject('airports', vm.includeAirports),//, dataFactory.getAutosuggestAirports),
            regions: vm.getStateManagerObject('regions', vm.includeRegions),//, dataFactory.getAutosuggestAirports),
            autosuggest: vm.getStateManagerObject('autosuggest', (vm.includeCities==='Y' || vm.includeHotels==='Y' || vm.includeAirports==='Y' || vm.includeRegions==='Y')?'Y':'N', dataFactory.getSimplifiedAutoSuggest),
            directories: vm.getStateManagerObject('directories', vm.includeDirectories, dataFactory.searchDirectory),
            hospitals: vm.getStateManagerObject('hospitals', vm.includeHospitals, dataFactory.searchHospitals)
            //pois: vm.getStateManagerObject('pois', vm.includePoi, dataFactory.getPointsOfInterest)
          },
          inProgress: function() {
            var t = 0;
            Object.keys(vm.stateManager.lookups).forEach(function(key,index) {
              t=t+ vm.stateManager.lookups[key].getFetchesInProgress();
            });
          },
          //remove all fetches matching unique search id
          clearFetchesInProgress: function(uniqueSearchId) {
              Object.keys(vm.stateManager.lookups).forEach(function(key,index) {
                var s = vm.stateManager.lookups[key];
                s.removeFetchInProgress(uniqueSearchId);
              });
          }
        };
                             


        //airports needs a single key (b/c all airports need to be retrieved the first time in order to relate them to cities)
        //vm.stateManager.lookups.airports.key = function(f2) { return this.baseKey; };



              //   // var fipidx = fetchesInProcess.indexOf(a.key);
              //   // if (fipidx === -1) {
              //   //   console.log('multicall response - did not find in fetchesInProcess: ' + a.key);
              //   //   return;
              //   // }
              //   fetchesInProcess.splice(fipidx,1);

        // vm.stateManager = {
        //   //string: searchStr.toLowerCase().substr(0,2),  // first2,
        //   datasets: [
        //   {
        //     //cities
        //     baseKey: 'cities',
        //     title: this.baseKey,
        //     key: this.baseKey+'_'+first2,
        //     include: vm.showCities,
        //     isCached: cacheService.containsKey(this.baseKey+'_'+first2),
        //     //TODO:
        //     cb: dataFactory.getAutosuggestCities //(vm.currentSearchParams)
        //   },{
        //     //hotels
        //     baseKey: 'hotels',
        //     title: this.baseKey,
        //     key: this.baseKey+'_'+first2,
        //     include: showHotels,
        //     isCached: cacheService.containsKey(this.baseKey+'_'+first2),
        //     cb: dataFactory.getAutosuggestHotels //(vm.currentSearchParams)
        //   },{
        //     //airports
        //     baseKey: 'airports',
        //     title: this.baseKey,
        //     key: this.baseKey, //need all airports for subsequent lookup
        //     include: showAirports,
        //     isCached: cacheService.containsKey(vm.cacheKeyAirports),
        //     cb: dataFactory.getAll //(vm.currentSearchParams)
        //   },{
        //     //directories
        //     baseKey: 'directories',
        //     title: this.baseKey,
        //     key: this.baseKey+'_'+first2,
        //     include: showDirectories,
        //     isCached: cacheService.containsKey(this.baseKey+'_'+first2),
        //     cb: dataFactory.searchDirectory  //(vm.currentSearchParams),
        //   }]
        // };

      }


      //*************** FUNCTIONS FOR SEARCH ***************//

      //minimize lookups having same key

      // LEFT OFF HERE - why wouldn't vm.cacheState do this?
      var fetchesInProcess = [];

      var doNotSearchList = ['the', 'and', '&', 'of', 'in', 'a'];

      var ts = new Date();
      var exit = false;

      //called when search text changes

      function refreshOptions(originalSearchStr, isOpen) {
        //var deferred = $q.defer();
        if (!isOpen || originalSearchStr==='') {
          return;
        }
        // ts = Date.now();
        // setTimeout(function() {
        //   var millis = Date.now() - ts;
        //   if (millis<250) {
        //     console.log('exiting: ' + originalSearchStr);
        //     exit = true;
        //   }
        // },250);

        // if (exit) {
        //   exit = false;
        //   return;
        // }

        // console.log('running with ' + originalSearchStr + ' - ' + new Date().getMilliseconds());

        searchStr = originalSearchStr.toLowerCase();

        var searchStringSpl = searchStr.split(' ');

        //eliminate if in do not search list
        $.each(doNotSearchList,function(index,doNotSearchItem) {
          var g = searchStringSpl.indexOf(doNotSearchItem);
          if (g > -1) {
              searchStringSpl.splice(g, 1);
          }
        });

        //eliminate if single letter words
        var searchStringSplLen = searchStringSpl.length;
        while (searchStringSplLen--) {
            if (searchStringSpl[searchStringSplLen].length === 1) { 
                searchStringSpl.splice(searchStringSplLen, 1);
            } 
        }

        searchStr = searchStringSpl.join(' ');
        // $.each(searchStringSpl,function(indexB,searchToken) {
          
        //   if (searchToken===doNotSearchItem) {
        //     searchStringSpl.pop
        //   }
        //   searchStr = searchStr.replace(new RegExp(doNotSearchItem, 'g'), '');
        // });
        

        //replace multiple spaces with a single space and trim
        searchStr = searchStr.replace(/ +(?= )/g,'').trim();

        //any characters?
        if (searchStr.length===0) {
          //console.log('refreshOptions - search length === 0 (quitting)');
          vm.options = [];
          return;
        }

        //min characters?
        if (searchStr.length<2) {
          //console.log('refreshOptions - search length < 2 (quitting)');
          return;
        }

        //reset current search parameters
        vm.currentSearchParams = {
          id: vm.getRandomId(),
          //TODO: replace a/the/& etc. goes here
          searchString: searchStr,
          searchStringSpl: searchStringSpl,
          f2: function() { return this.searchString; } //.substr(0,2); } //.toLowerCase() already lower cased, right?
        };

//update previous search params
//when does it hit this?
vm.previousSearchParams = vm.currentSearchParams;

        //set user facing message
        vm.SetMessage('Looking up "'+originalSearchStr+'"');

        

        //already cached everything we need?
        // if (vm.cachedF2[vm.currentSearchParams.f2()]) {
        //   vm.updateMatchingSet();
        //   return;
        // }


//console.log(originalSearchStr + ' - ' + new Date().getMilliseconds());
        //fetch data
        return dataFactory
            .multiCall(vm.stateManager.lookups, vm.currentSearchParams, fetchesInProcess)
            .then(function(response) {
              //exit if unexpected response
              if (!response || response.constructor !== Array) {  // || response.length===0) {
                  //console.log('wherepicker - multicall response - unexpected schema');
                  return;
              }

              //exit if any fetches of same key are still in progress (ex third letter waiting for return from 2nd)
              // if (vm.stateManager.cities.isFetchInProgress(searchParams.f2())) {
              //     console.log('datafactory.multicall - fetch already in progress: ' + a.key);
              //     return;
              // }

              // //remove fetches that are no longer in process
              // fetchesInProcess.forEach(function(a) {

              //   if (a.key === undefined) {
              //     console.log('multicall response - key not available?: ' + a);
              //     return;
              //   }

              //   // var fipidx = fetchesInProcess.indexOf(a.key);
              //   // if (fipidx === -1) {
              //   //   console.log('multicall response - did not find in fetchesInProcess: ' + a.key);
              //   //   return;
              //   // }
              //   fetchesInProcess.splice(fipidx,1);
              // });


              // //note if fetches are still outstanding
              // if (fetchesInProcess.length>0) {
              //   console.log('multicall response - fetches still outstanding: ' + fetchesInProcess);
              // }

              //stale search string?
              if (vm.previousSearchParams !== {} && vm.previousSearchParams.searchString !== vm.currentSearchParams.searchString) {
                  //console.log("muticall response - deferring to a more recent search string");
                  return;
              }
              
              var uniqueSearchId;
              var searchString;
              var items = [];
              //var includeAirports = false;


              //-- cache data from multicall --//
              for (var i = 0; i<response.length;i++) {

                var a = response[i];

                //hack for hospital data
                if (a.data.features) {
                  a.data.title='hospitals';
                  a.data.searchString=vm.currentSearchParams.searchString;
                  a.data.results = a.data.features;
                }

                //hack for pois
                if (a.data.hits) {
                  a.data.title='pois';
                  a.data.searchString=vm.currentSearchParams.searchString;
                  a.data.results = a.data.hits
                }

                uniqueSearchId = a.data.id;
                searchString = a.data.searchString;

                //1. data exists?
                if (!a || !a.data) {
                  continue;
                }

                //2. any warnings?
                if (a.data.warnings && a.data.warnings.length>0) {
                  //console.log('wherepicker - response - warnings found: ' + response.data.warnings);
                  continue;
                }

                //3. value already in cache?
                if (searchString === undefined) {
                  //console.log('wherepicker - response - already in cache');
                  continue;
                }

                //4. single call to cities, hotels, airports, regions?
                if (a.data.title === 'autosuggest') {
                  var mockResponseRegions =  {
                    data: {
                      id: a.data.id,
                      searchString: a.data.searchString,
                      results: a.data.results = a.data.regionResults,
                      title: a.data.title = 'regions'
                    }
                  };
                  response.push(mockResponseRegions);

                  var mockResponseAirports =  {
                    data: {
                      id: a.data.id,
                      searchString: a.data.searchString,
                      results: a.data.results = a.data.airResults,
                      title: a.data.title = 'airports'
                    }
                  };
                  response.push(mockResponseAirports);

                  var mockResponseCities =  {
                    data: {
                      id: a.data.id,
                      searchString: a.data.searchString,
                      results: a.data.results = a.data.cityResults,
                      title: a.data.title = 'cities'
                    }
                  };
                  response.push(mockResponseCities);

                  var mockResponseHotels =  {
                    data: {
                      id: a.data.id,
                      searchString: a.data.searchString,
                      results: a.data.results = a.data.hotelResults,
                      title: a.data.title = 'hotels'
                    }
                  };
                  response.push(mockResponseHotels);

                  continue;
                }

                //4. results check
                //1. data exists?
                if (!a.data.results || a.data.results.length===0) {
                  continue;
                }

                
                var currentStateManagerObj = vm.stateManager.lookups[a.data.title];  //ex cities

                //determine lookup key (ex cities_ne)
                var currentLookupKey = currentStateManagerObj.key(searchString);  //.substr(0,2));
                //if (a.data.title === 'airports') currentLookupKey = 'airports';

                //check for inclusion
                if (!currentStateManagerObj.isIncluded()) {
                  //console.log('wherepicker - response - data type not included: ' + a.data.title);
                  continue;
                }

                //double check for race condition
                if (cacheService.containsKey(currentLookupKey)) {
                  //console.log('multicall response - cache already contains key: ' + currentLookupKey);
                  continue;
                }

                //3. cache results
                cacheService.put(currentLookupKey,a.data.results);

                //vm.stateManager.datasets.forEach(function(x) {
                // Object.keys(vm.stateManager).forEach(function(key,index) {
                //   var s = vm.stateManager[key];
                //   var currentLookupKey = s.key(searchString.substr(0,2));

                //   //ds of interest?
                //   if (s.baseKey !== a.data.title) return;

                //   //check for inclusion
                //   if (!s.isIncluded()) return;
                 
                //   //double check for race condition
                //   if (cacheService.containsKey(currentLookupKey)) {
                //     console.log('multicall response - cache already contains key: ' + currentLookupKey);
                //     return;
                //   }

                //   //cache it
                //   cacheService.put(currentLookupKey,a.data.results);
                // });
              }


              //consolidate all desired entries (except airports)
              //vm.cacheState.datasets.forEach(function(x) {
              Object.keys(vm.stateManager.lookups).forEach(function(key,index) {
                var s = vm.stateManager.lookups[key];
                var currentLookupKey = s.key(vm.currentSearchParams.searchString);  //.substr(0,2));

                //handle airports separately
                // if (s.baseKey === 'airports') {
                //   return;
                // }
                //if (x.key === vm.cacheKeyAirports) {
                // if (x.key === vm.stateManager.lookups.airports.baseKey) {
                //   includeAirports = x.include;
                //   return;
                // }

                //include?
                if (!s.isIncluded()) {
                  return;
                }
                //if (!x.include) return;

                // entries exist?
                var currentEntry = cacheService.get(currentLookupKey);
                if (currentEntry == undefined) {
                  //console.log('multicall response - no entries found for: ' + currentLookupKey);
                  //return;
                }

                //append entries
                //var currentLookupKey = s.getFetchInProgressKey(uniqueSearchId);
                if (currentEntry !== undefined) {
                  items = items.concat(cacheService.get(currentLookupKey));
                }
                //items = items.concat(cacheService.get(x.key));
                //$.unique
              });

                



                // if (vm.cachedF2[vm.currentSearchParams.f2()] === undefined) {
                //    vm.cachedF2[vm.currentSearchParams.f2()] = [];
                // }

                //4. merge results
                //vm.cachedF2[vm.currentSearchParams.f2()] = $.unique(vm.cachedF2[vm.currentSearchParams.f2()].concat(a.data.results));

                //previous and working
                //if (vm.cachedF2[vm.currentSearchParams.f2()] === undefined) {     //if not race condition
                //    //create new cached entry
                //    vm.cachedF2[vm.currentSearchParams.f2()] = a.data.results;
                //}

              
              //formerly a call to updateMatchingSet

              //any items exist?
              if (!items || items.length === 0) {
                  //console.log('wherepicker - no items');
                  vm.SetMessage('No entries found for "'+vm.currentSearchParams.searchString+'"');
                  vm.options = [];
                  if (uniqueSearchId) {
                    vm.stateManager.clearFetchesInProgress(uniqueSearchId);
                  }
                return;
              }
              

var originalSearchStr = vm.currentSearchParams.searchString;  //response[0].data.searchString;

//console.log(originalSearchStr + ' - ' + new Date().getMilliseconds());

//commenting this out while we test if getting from server each time is more performant overall
//update matching set
//if (vm.currentSearchParams.searchString.length==2) {
  vm.matchingSet = items;
// } else {
//   vm.matchingSet = items.filter(findF2Func);
// }

              //append airports (matching, related by city)
              // if (vm.includeAirports) {
              //   //var allAirports = cacheService.get(vm.cacheKeyAirports);
              //   var allAirports = cacheService.get(vm.stateManager.lookups.airports.baseKey);
              //   if (allAirports) {
              //     vm.matchingSet = vm.matchingSet.concat(allAirports.filter(matchingAndRelatedAirports));
              //   }
              //   //and (substring(airport,1,2)=substring(@str,1,2) OR substring(iata,1,2)=substring(@str,1,2))
              // }

              //len >2?
              // if (vm.currentSearchParams.searchString.length==2) {
              //   vm.matchingSet = vm.cachedF2[vm.currentSearchParams.f2()];
              // } else {
              //   vm.matchingSet = vm.cachedF2[vm.currentSearchParams.f2()].filter(findF2Func);
              // }

              //any matches?
              // setTimeout(function()
              // {
              //     if (vm.matchingSet.length===0 && fetchesInProcess.length === 0) {
              //       var s = 'No matches found for "'+vm.currentSearchParams.searchString+'"';
              //       console.log(s);
              //       vm.message = s;
              //       return;
              //     }
              // }, 2000);

              //update UI
              vm.updateUI(originalSearchStr);
              //console.log(originalSearchStr + ' - ' + new Date().getMilliseconds());
        });

      }


      //determine the current set of matches
      // function updateMatchingSet(uniqueSearchId) {

        
      // }

      //filter: find entries matching search string
      var findF2Func = function (val, idx, arr) {
      	if (!val) return false;

        // hotel filter
        //todo: filter is applied to actual value ie that we will display - LEFT OFF HERE
      	//var searchFilter = val[val.t].toLowerCase().startsWith(vm.currentSearchParams.searchString.toLowerCase());
        var searchFilter= true;
        $.each(vm.currentSearchParams.searchStringSpl, function(i,v) {
          if (val[val.t].toLowerCase().indexOf(v.toLowerCase())===-1) {
            searchFilter = false;
          }
        });
        //var searchFilter = val[val.t].toLowerCase().indexOf(vm.currentSearchParams.searchString.toLowerCase())>-1;

        // city filter
      	var cityFilter = true;
        // why are we appending a city filter if we are doing a separate lookup? is this the cause for multiple cities being returned?
				//filter exists?
        if (vm.filter) {
          //cityFilter = val.c.toLowerCase().startsWith(vm.filter.toLowerCase());
          cityFilter = val.c.toLowerCase().indexOf(vm.filter.toLowerCase())>-1;

        }

        return searchFilter && cityFilter;

        //hotels
        // if (val.t ==='h') {
        //  return val.h.startsWith(vm.currentSearchParams.searchString);
        // }
        // //cities
        // if (val.t ==='c') {
        //  return val.c.startsWith(vm.currentSearchParams.searchString);
        // }
      };


      var matchingAndRelatedAirports = function(val,idx,arr) {
        if (!val) return false;

        //match: what user has typed in
        var s = vm.currentSearchParams.searchString.toLowerCase();
        if (val[val.t].toLowerCase().startsWith(s) || val.i.toLowerCase().startsWith(s)) {
          return true;
        }

        //related: to cities that match
        return vm.matchingSet
        .filter(function(a) {
          return (a.t==='c');
        })
        .map(function(c) { return c.p; })
        .indexOf(val.p)>-1;
      };

     
      function updateUI(originalSearchStr) {

        //max cities returned in list
        var maxCities = 5;
        var maxHospitals = 3;
        var maxPois = 3;
        var maxRegions = 3;

        var cityCount = 0;
        var hospitalCount = 0;
        var poiCount = 0;
        var regionCount = 0;

        //temp hold options (to minimize flickering?)
        var tempOptions = new Array(vm.maxToReturn);

        //getAllAirports was here - but why???

        var getMatchingCities = function(p) {
          if (!vm.allAirportData) return [];
          return vm.allAirportData.filter( function(airport) { return airport.p === p; });
        };


        //populate temporary holder
        for (var i=0;i<vm.matchingSet.length;i++) {

          //have we reached 35 entries? (make an exception for airports b/c otherwise the 35 entries will be used up by hotels)
          if (tempOptions.length>vm.maxToReturn && vm.matchingSet[i].t!=='a') 
            continue;

          //us only? (city type search only)
          if (vm.usOnly==='Y' && vm.matchingSet[i].t==='c' && vm.matchingSet[i].o!=='United States') {
            continue;
          }
          console.log('passes us only: ' + vm.matchingSet[i].c);

          //determine display
          var display = '';
          var type = '';
          var count = 0;
          var city = '';
          var state = '';
          var country = '';
          var code = '';
          var longitude = '';
          var latitude = '';
          var cityid = '';

          //city
          if (vm.matchingSet[i].t==='c') {

            if (cityCount>=maxCities) {
              continue;
            }

            //for flights, cities must be in ppn.airAirports.
            if (vm.isForFlights==='Y') {
              //if (vm.matchingSet[i].a===0) continue;
              var matCities = getMatchingCities(vm.matchingSet[i].p);
              if (matCities.length===0) {
                continue;
              }
            }

            cityCount++;
            
            //todo: check if this makes sense
            display = vm.matchingSet[i].c.concat(', ',vm.matchingSet[i].s||'', ', ', vm.matchingSet[i].o||'').replace(' , ',' ');
            type = 'city';
            count = vm.matchingSet[i].i;
            city = vm.matchingSet[i].c;
            state = vm.matchingSet[i].s;
            country = vm.matchingSet[i].o;
          }

          //airport
          if (vm.matchingSet[i].t==='a') {
            display = '['+ vm.matchingSet[i].i + '] ' + vm.matchingSet[i].a;
            type = 'airport';
            count = 5000; //so it appears higher in results
            code = vm.matchingSet[i].i;
            //city = vm.matchingSet[i].c;
          }

          //hospital
          if (vm.matchingSet[i].attributes) {
            
            if (hospitalCount>=maxHospitals) {
              continue;
            }

            hospitalCount++;

            display = vm.matchingSet[i].attributes.NAME;
            city = vm.matchingSet[i].attributes.CITY;
            state = vm.matchingSet[i].attributes.STATE;
            country = 'United States';
            longitude = vm.matchingSet[i].geometry.x;
            latitude = vm.matchingSet[i].geometry.y;
            type = 'hospital';
            count = 4000; //so it appears higher in results
          }

          //poi
          if (vm.matchingSet[i]._index==='accessiblego_pois') {
            
            if (poiCount>=maxPois) {
              continue;
            }

            if (!vm.matchingSet[i]._source.city_id || vm.matchingSet[i]._source.city_id==='') {
              continue;
            }

            poiCount++;

            display = vm.matchingSet[i]._source.poi_name;
            vm.matchingSet[i].p = vm.matchingSet[i]._source.poiid_ppn;
            //city = vm.matchingSet[i].attributes.CITY;
            //state = vm.matchingSet[i].attributes.STATE;
            //country = 'United States';
            //longitude = vm.matchingSet[i].geometry.x;
            //latitude = vm.matchingSet[i].geometry.y;
            type = 'poi';
            cityid = vm.matchingSet[i]._source.city_id;
            count = 3000; //so it appears higher in results
          }

          //hotel
          if (vm.matchingSet[i].t==='h') {
            display = vm.matchingSet[i].h;
            type = 'hotel';
            city = vm.matchingSet[i].c;
            state = vm.matchingSet[i].s;
            country = vm.matchingSet[i].o;
          }

          //directory
          if (vm.matchingSet[i].t==='d') {
            display = vm.matchingSet[i].d;
            city = vm.matchingSet[i].c;  //this is needed so that the ui-select doesn't stumble when directories are included (b/c city is part of filter)
            type = 'directory';
          }

          //region
          if (vm.matchingSet[i].t==='r') {
            if (regionCount>=maxRegions) {
              continue;
            }
            display = vm.matchingSet[i].n;
            type = 'region';
            count = 4500; //so it appears higher in results
          }

          tempOptions[i] = {
            type: type,
            ppnid: vm.matchingSet[i].p,
            display: display,
            count: count,
            city: city,
            state: state,
            country: country,
            code: code,
            longitude: longitude,
            latitude: latitude,
            cityid: cityid
          };
        }

        //reset results array
        vm.options = tempOptions;


//FOR NEW AUTOSUGGEST!!!
              //var q = term.toLowerCase().trim();
              var term = originalSearchStr; //$scope.selectedAutoCompleteValue.value;
              // Find first 10 states that start with `term`.

              // var newOptions = [];
              // vm.options.forEach(function(option) {
              //   var aug = vm.getAugmentedDisplay(option);
              //   newOptions.push({
              //     value: option.display,
              //     obj: option,
              //     label: $sce.trustAsHtml(
              //         '<div class="row" style="line-height:1em;padding-top:5px;padding-bottom:5px;">' +

              //         //-- icon
              //         ' <div style="width:22px;" class="col-xs-2">' +
              //         //'  <i ng-class="{\'fa fa-building width2em\':\''+option.type+'\'===\'hotel\', \'fa fa-map-marker width2em\':\''+option.type+'\'===\'city\', \'fa fa-flag width2em\':\''+option.type+'\'===\'directory\', \'fa fa-plane width2em\':\''+option.type+'\'===\'airport\'}" aria-hidden="true"></i> ' +
              //         '  <i class="'+ vm.getClass(option.type) + '" aria-hidden="true"></i>' +
              //         ' </div>' +

              //         //-- display name
              //         ' <div class="col-xs-10" style="xmax-width:30em;">' +
              //         '  <small xstyle="font-size:.em;">'+vm.highlight(option.display,term)+'</small>'+
              //         ' </div>' +

              //         //-- location
              //         //text-right text-muted
              //         (aug===''?'':
              //           //' <div style="width:22px;" class="col-xs-2">&nbsp;</div>' +
              //           ' <div class="col-xs-12" style="padding-left:45px;">' +
              //           '  <span style="font-size:.75em;">' +  aug + '</span>' +
              //           ' </div>') +

              //         // ' <div class="col-xs-12">' +
              //         // '  <span class="text-muted">Joined</span>' + option.type +
              //         // ' </div>' +
              //         '</div>'
              //       )
              //   });
              // });




        //default first entry
        if ($scope.options && $scope.options[0]) {
          $scope.selectedValue = $scope.options[0];
        }

      

        //add cities
        // if (vm.searchParams.includeCities) {
        //   for (var i=0;i<Math.min(cities.length,vm.maxToReturn);i++) {
        //     vm.options[i] = {
        //       ppnid: cities[i].p,
        //       display: cities[i].n.concat(', ',cities[i].s||'', ', ', cities[i].c||'').replace(' , ',' '),
        //       count: cities[i].i,
        //       type: 'city'  //needed for url for hotel search
        //     };
        //   }
        // }



        //   //append hotels to list
        //   //var hotels = [];
        //   if (vm.includeHotels ==='Y') {
        //     //hotels = 
        //     vm.appendHotels(response.data.hotels);  
        //   }

          

          //vm.options = cities.concat(hotels);
      }
      
      //todo: deprecate this
      function appendCities(cities,searchStr) { //cities,searchStr) {

        //vm.options = [];  //not performant
        //vm.options.length = 0;
        //var opts = new Array(vm.maxCitiesToReturn);

        // if (!cities) return;
        // if (cities.length===0) return;

        //var searchStrLCase = searchStr.toLowerCase();
        for (var i=0;i<Math.min(cities.length,vm.maxToReturn);i++) {

          //determine display
          //if (cities[i].s) cityDisplay+=', '+cities[i].s;
          //if (cities[i].c) cityDisplay+=', '+cities[i].c;

          //is a match?
          // if (!cities[i].display.toLowerCase().startsWith(searchStrLCase)) {
          //     continue;
          // }

          //push
          // vm.options.push({
          //   ppnid: cities[i].p,
          //   display: cities[i].n.concat(', ',cities[i].s||'', ', ', cities[i].c||'').replace(' , ',' '),
          //   type: 'city'  //needed for url for hotel search
          // });
          vm.options[i] = {
            ppnid: cities[i].p,
            display: cities[i].n.concat(', ',cities[i].s||'', ', ', cities[i].c||'').replace(' , ',' '),
            count: cities[i].i,
            type: 'city'  //needed for url for hotel search
          };

          /*
<i ng-if="option.type==='hotel'" class="fa fa-bed width2em" aria-hidden="true"></i>
<i ng-if="option.type==='c'" class="fa fa-map-marker width2em" aria-hidden="true"></i>
<i ng-if="option.type==='airport'" class="fa fa-plane width2em" aria-hidden="true"></i>
<i ng-if="option.type==='poi'" class="fa fa-map-marker width2em" aria-hidden="true"></i>
<!-- <i ng-if="type==='region'" class="" aria-hidden="true"></i> -->
          */

          // vm.options.push({
          //   ppnid: cities[i].cityid_ppn,
          //   display: cities[i].display,
          //   type: 'city'
          // });
        }

        //is checking it here going to speed it up?
        if (vm.prevSearchString !== '' && searchStr !== vm.prevSearchString) {
          return;
        }

        //reset the display instance
        //vm.options = opts;
        //return opts;
      }


      function appendHotels(hotels) {
        if (!hotels) return;

        
        //var opts = new Array(vm.maxHotelsToReturn);

        //console.log("max set to" + max);

        for (var i=0;i<Math.min(hotels.length,vm.maxToReturn);i++) {
          //var hotelDisplay = hotels[i].n; //.hotel_name;
          //if (hotels[i].area_name) hotelDisplay+=' ('+hotels[i].area_name+')';

          //var cityName = '';
          //if (hotels[i].c) {  //.address.city_name) {
          //  cityName = hotels[i].c; //.address.city_name;
          //}

          // var stateCode = '';
          // if (hotels[i].s) {  //.address.state_code) {
          //   stateCode = hotels[i].s; //.address.state_code;
          // }

          vm.options.push({
            ppnid: hotels[i].p, //hotelid_ppn,
            display: hotels[i].n,
            type: 'hotel',
            city: hotels[i].c,
            state: hotels[i].s
          });
        }

        //reset the display instance
        //vm.options = opts;
        //return opts;
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

      function selectedOptionChanged() {
          if (typeof vm.onChange === 'function') {
              vm.onChange(vm.selectedValue);
          }

      }


      vm.tagTransform = tagTransform;
      function tagTransform(newTag) {
        var item = {
            formatted_city: newTag,
        };
        return item;
      }
   };

   wherePickerController.$inject = ['$scope','$sce', '$q', 'dataFactory','cacheService','localStorageService'];

   var wherePickerFunc = function ($parse) {
      return {
         restrict: 'E',
         //replace: true,
         //transclude: false,
         controller: wherePickerController,
         controllerAs: 'vm',
         bindToController: true,
         template: require("./wherePicker.html"),
         scope: {
            //name: '@'    //Used to pass a string value into the directive
            //name: '='    //2 way binding
            //action: '&'  //Allows an external function to be passed into the directive and invoked
            includeHotels: '@includeHotels',
            includeCities: '@includeCities',
            includeAirports: '@includeAirports',
            includeRegions: '@includeRegions',
            isForFlights: '@isForFlights',
            includeDirectories: '@includeDirectories',
            label: '@label',
            selectedValue: '=ngModel',
            placeholder: '@placeholder',
            filter: '@filter',
            onChange: '=onChange',
            id: '@id',
            usOnly: '@usOnly',
            includeHospitals: '@includeHospitals',
            includePoi: '@includePoi'
         },
         link: function(scope, element, attrs) {
         }
       };   //return
   };   //wherePickerFunc

    wherePickerFunc.$inject = ['$parse'];
    angular.module('app').directive('wherePicker', wherePickerFunc);
})();

angular.module('app').filter('propsFilter', function() {

  var vm = this;
  vm.accent_map = { 'á':'a', 'é':'e', 'í':'i','ó':'o','ú':'u' };
  vm.accent_fold = accent_fold;

  function accent_fold (s) {
    if (!s) { return ''; }
    var ret = '';
    for (var i = 0; i < s.length; i++) {
      ret += vm.accent_map[s.charAt(i)] || s.charAt(i);
    }
    return ret;
  };

  return function(items, props) {
    var out = [];

    if (!angular.isArray(items)) {
      // Let the output be the input untouched
      out = items;
      return out;
    }

    items.forEach(function(item) {
      var itemMatches = false;

      var keys = Object.keys(props);
      for (var i = 0; i < keys.length; i++) {
        var prop = keys[i];
        var text = props[prop].toLowerCase();
        var searchStrSplit = text.split(' ');
        for (var q = 0; q < searchStrSplit.length; q++) {
          if (!item[prop]) break;
          var userSearchTextCleaned = vm.accent_fold(searchStrSplit[q]);
          var existingItemCleaned = vm.accent_fold(item[prop].toString().toLowerCase());
          if (existingItemCleaned.indexOf(userSearchTextCleaned) !== -1) {
            itemMatches = true;
            break;
          }
        }
      }

      if (itemMatches) {
        out.push(item);
      }
    });

    return out;
  };
});
