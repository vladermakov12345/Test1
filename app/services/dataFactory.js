//functions within the factory return a promise that can be wired up to callback functions by the caller.
//factories are singletons by default so the object returned by the factory can be re-used over and over by different controllers in the application

module.exports = function(mod){
    var dataFactory = function ($http, utilities, $q, transformRequestAsFormPost, localStorageService, environmentService, $sce) {

        var vm = this;
        vm.env = environmentService();

        vm.getRequestWithAuthHandler = getRequestWithAuthHandler;
        vm.postRequestWithAuthHandler = postRequestWithAuthHandler;
        vm.getAccessToken = getAccessToken;
        vm.getIdToken = getIdToken;

        var dataFactory = {};


        //=========== DIAGNOSTIC =======//
        dataFactory.track = function(errObj) {

            errObj.httpResponse = JSON.stringify(errObj.httpResponse);

            var url = vm.env.BASEURL_CRM + '/api/diagnostic/track';
            return vm.postRequestWithAuthHandler(url, errObj);
        };


        //=========== PUBLIC ===========//

        //CITY
        dataFactory.getCity = function (cityId) {
            var url = vm.env.BASEURL_CONTENT + '/City/Get?cid=' + cityId;
            var options = { cache: true };
            return $http.get(url, options);
        };
        dataFactory.getPricelineCityByName = function (cityName) {
            var url = vm.env.BASEURL_CRM + '/api/city/' + cityName;
            var options = { cache: true };
            return $http.get(url, options);
        };

        dataFactory.getAllCities = function (includeNonCity) {
            var nc = 'f';
            if (includeNonCity && includeNonCity === true) nc = 't';
            var url = vm.env.BASEURL_CONTENT + '/City/GetAll?nc=' + nc;
            var options = { cache: true };
            return $http.get(url, options);

            //--> do we need this?
            // dataType: "json",   //what to return, whereas content-type is what you are sending
            // headers: {
            //     'Content-Type': 'application/json; charset=utf-8'
            // }
        };

        /* not used
        dataFactory.getCityByName = function (name) {
            var url = vm.env.BASEURL_CONTENT + '/City/GetByName?name=' + name
            var options = { cache: false };
            return $http.get(url, options);
        };
        */

        //DIRECTORY
        //old :: fetch from admin db
        dataFactory.getDirectoryBy = function (filter) {
            var url = vm.env.BASEURL_CONTENT + '/Directory/GetAllBy?city=' + filter.city + '&type=' + filter.type + '&category=' + filter.category;
            var options = { cache: true };
            return $http.get(url, options);
        };

        //get all providers for a given city
        dataFactory.getProviders = function (params) {
            var url = vm.env.BASEURL_CRM + '/api/Providers/get?city=' + encodeURIComponent(params.city) + '&state=' + encodeURIComponent(params.state) + '&country=' + encodeURIComponent(params.country);
            var options = {
                cache: true,
                responseType: 'json'
            };
            return $http.get(url, options);
        };

        //get provider detail by slug
        dataFactory.getProvider = function (params) {
            var url = vm.env.BASEURL_CRM + '/api/Provider/get?city=' + encodeURIComponent(params.city) + '&state=' + encodeURIComponent(params.state) + '&country=' + encodeURIComponent(params.country) + '&slug=' + encodeURIComponent(params.slug);
            var options = {
                cache: true,
                responseType: 'json'
            };
            return $http.get(url, options);
        };




        dataFactory.getBusiness = function (params) {
            var url = vm.env.BASEURL_CONTENT + '/Directory/Get?city=' + params.city + '&type=' + params.type + '&category=' + params.category + '&slug=' + params.slug;
            var options = { cache: true };
            return $http.get(url, options);
        };
        dataFactory.getBusinesses = function (params) {
            var url = vm.env.BASEURL_CONTENT + '/Directory/GetAllForSEO';
            var options = { cache: true };
            return $http.get(url, options);
        };
        dataFactory.getDirectoryEntryById = function (directoryId) {
            var url = vm.env.BASEURL_CONTENT + '/Directory/GetById?directoryId=' + directoryId;
            var options = { cache: false };     //data could be changed by user within their session, so setting false
            return $http.get(url, options);
        };
        dataFactory.searchDirectoryEntries = function (searchString) {
            var url = vm.env.BASEURL_CONTENT + '/Directory/SearchDirectoryEntries?s=' + searchString;
            var options = { cache: false };     //data could be changed by user within their session, so setting false
            return $http.get(url, options);
        };

        dataFactory.GetDirectoryReviewsById = function (directoryId) {
            var url = vm.env.BASEURL_PRICELINE + 'reference/getReviews?directoryId=' + directoryId;
            var options = { cache: false };     //data could be changed by user within their session, so setting false
            return $http.get(url, options);
        };

        //ARTICLE
        dataFactory.getAllArticles = function (includeNonCity) {
            var nc = 'f';
            if (includeNonCity && includeNonCity === true) nc = 't';
            var url = vm.env.BASEURL_CONTENT + '/Article/GetAll?nc=' + nc;
            var options = { cache: true };
            return $http.get(url, options);
        };

        // dataFactory.getArticle = function (articleid) {
        //     return $http.get(BASEURL_CONTENT + '/Article/Get?aid=' + articleid);
        // };

        dataFactory.getArticleByTitle = function (title) {
            title = title.replace(" ", "_");
            var url = vm.env.BASEURL_CONTENT + '/Article/GetByTitle?title=' + title;
            var options = { cache: true };
            return $http.get(url, options);
        };

        dataFactory.getArticleByCityAndType = function (city, type) {
            var options = { cache: true };
            return $http.get(vm.env.BASEURL_CONTENT + '/Article/GetByCityAndType?city=' + city + "&type=" + type);
        };

        dataFactory.searchArticles = function (phrase) {
            var url = vm.env.BASEURL_CONTENT + '/Article/Search?phrase=' + phrase;
            var options = { cache: false }; //may cause unexpected results, so setting false
            return $http.get(url, options);
        };

        //CRUISE
        dataFactory.getCruises = function (articleid) {
            var url = vm.env.BASEURL_CONTENT + '/Cruises/Get';
            var options = { cache: true };
            return $http.get(url, options);
        };


        //================= STATIC JSON =======================//
        //custom amenity data
        dataFactory.getCustomAmenityData = function () {
            var url = vm.env.cdn + '/data/hotelAccessibilityData.json';

            //todo: create separate environment for dev version(?)
            // if (vm.env.name === 'development') {
            //     url =  vm.env.BASEURL_PRICELINE + 'hotels/HotelAccessibilityData';
            // }
            
            var options = { cache: true };
            return $http.get(url, options);
        };

        //review data
        dataFactory.getAllHotelReviewData = function () {
            //var url = vm.env.cdn + '/data/hotelReviewData.json';

            //todo: create separate environment for dev version(?)
            //if (vm.env.name === 'development') {
            //    url =  vm.env.BASEURL_PRICELINE + 'review/getAllByType?rType=h';
            //}

            var url =  vm.env.BASEURL_PRICELINE + 'review/getAllByType?rType=h';
            var options = { cache: false };
            return $http.get(url, options);
        };

        dataFactory.getTestimonialData = function() {
            var testimonials = [
            {
                "name":"Nann C.",
                "location":"USA",
                "text":"The site is really user friendly and has great discounts. Our accessible room had all the necessary amenities and ample room for a wheelchair."
            },
            {
                "name":"Shirvon A.",
                "location":"USA",
                "text":"I love that there is a place to share experiences with others in similar circumstances."
            },
            {
                "name":"Dennis L.",
                "location":"USA",
                "text":"I look forward to writing many reviews about my traveling experiences!"
            },
            {
                "name":"Marj N.",
                "location":"USA",
                "text":"I am so glad I found accessibleGO. It's going to be my first choice as a source when I travel."
            },
            {
                "name":"Loletta K.",
                "location":"USA",
                "text":"This works, I've used this service!"
            },
            {
                "name":"Julia",
                "location":"USA",
                "text":"This is awesome! My husband and I have been looking for a service like yours."
            },
            {
                "name":"Frankie C.",
                "location":"USA",
                "text":"This is so awesome!! Working with as many kids and adults with [disabilities] as I have, I can tell you this is much appreciated!."
            },
            {
                "name":"Lindsey M.",
                "location":"USA",
                "text":"Thank you for creating this resource and community! I’m in a wheelchair and my husband is able bodied. We struggle to find activities to do together, especially on vacation."
            },
            {
                "name":"Bhavni S.",
                "location":"London, UK",
                "text":"I am an electric wheelchair user from London. accessibleGO is a perfect portal for disabled people to book their holidays and trips. I spend endless hours trying to find attractions, itineraries, caregivers, transportation and equipment rental in a city and hence love the fact that accessibleGO has incorporated all this into one website. The level of detail on hotels is fantastic.  It allows people to feel confident in knowing they are booking something that is right for them."
            }

            ];
            return testimonials;
        };

        dataFactory.getPartnerData = function () {
            var url = vm.env.cdn + '/data/partners.json';

            //todo: create separate environment for dev version(?)
            //if (vm.env.name === 'development') {
            //    url =  vm.env.BASEURL_PRICELINE + 'hotels/HotelAccessibilityData';
            //}
            
            var options = { cache: true };
            return $http.get(url, options);
        };

        dataFactory.getHomepageCitiesData = function() {
            var cities =
            [
                {
                    ppnid: 800049030,
                    name:'Las Vegas',
                    state:'Nevada',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/las-vegas.jpg",
                    num_accessible_hotels:30,
                    num_resources: 85,
                    num_hotel_reviews: 19
                },
                {
                    ppnid: 800047448,
                    name:'Orlando',
                    state:'Florida',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/orlando.jpg",
                    num_accessible_hotels:'100+',
                    num_resources: 87,
                    num_hotel_reviews: 11
                },
                {
                    ppnid: 800049480,
                    name:'New York City',
                    state:'New York',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/new-york.jpg",
                    num_accessible_hotels:'100+',
                    num_resources: 111,
                    num_hotel_reviews: 7
                },

                {
                    ppnid: 800046990,
                    name:'San Diego',
                    state:'California',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/san-diego.jpg",
                    num_accessible_hotels:'88',
                    num_resources: 95,
                    num_hotel_reviews: 1
                },
                {
                    ppnid: 800047804,
                    name:'Chicago',
                    state:'Illinois',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/chicago.jpg",
                    num_accessible_hotels:'83',
                    num_resources: 99,
                    num_hotel_reviews: 3
                },
                {
                    ppnid: 800048265,
                    name:'New Orleans',
                    state:'Louisiana',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/new-orleans.jpg",
                    num_accessible_hotels:'82',
                    num_resources: 78,
                    num_hotel_reviews: 7
                },
                {
                    ppnid: 800047553,
                    name:'Atlanta',
                    state:'Georgia',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/atlanta.jpg",
                    num_accessible_hotels: 152,
                    num_resources: 93,
                    num_hotel_reviews: 4
                },
                {
                    ppnid: 800047703,
                    name:'Honolulu',
                    state:'Hawaii',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/honolulu-230x230.png",
                    num_accessible_hotels: 37,
                    num_resources: 81,
                    num_hotel_reviews: 3
                },
                {
                    ppnid: 800049611,
                    name:'Charlotte',
                    state:'North Carolina',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/charlotte-230x230.png",
                    num_accessible_hotels: 20,
                    num_resources: 77,
                    num_hotel_reviews: 3
                },
                {
                    ppnid: 800048593,
                    name:'Detroit',
                    state:'Michigan',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/detroit-230x230.png",
                    num_accessible_hotels: 13,
                    num_resources: 84,
                    num_hotel_reviews: 0
                },
                {
                    ppnid: 800050468,
                    name:'Austin',
                    state:'Texas',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/austin-230x230.png",
                    num_accessible_hotels: 130,
                    num_resources: 80,
                    num_hotel_reviews: 3
                },
                {
                    ppnid: 800048424,
                    name:'Boston',
                    state:'Massachusetts',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/boston-230x230.png",
                    num_accessible_hotels: 50,
                    num_resources: 82,
                    num_hotel_reviews: 4
                },
                {
                    ppnid: 800048424,
                    name:'Washington',
                    state:'District Of Columbia',
                    country:'United States',
                    image:"https://accessiblego.z20.web.core.windows.net/i/cities/washingtonDC_289_289.png",
                    num_accessible_hotels: 50,
                    num_resources: 82,
                    num_hotel_reviews: 4
                }
            ];
            return cities;
        };

        dataFactory.contact = function (name, email, message) {
            //todo: do we need to url encode???
            var url = vm.env.BASEURL_CRM + '/api/email/contact?name=' + encodeURIComponent(name) + '&email=' + encodeURIComponent(email) + '&message=' + encodeURIComponent(message);
            //var data = {name: name, email: email, message: message };
            //return $http.post(url, data);
            return $http.get(url);
        };

        // dataFactory.setupMUUT = function (userParams) {
        //     return $http({
        //         url: vm.env.BASEURL_CRM + '/api/muut/setup',
        //         method: "POST",
        //         transformRequest: transformRequestAsFormPost,
        //         data: userParams,
        //         headers: {
        //             'Content-Type': 'application/x-www-form-urlencoded'
        //         }
        //         //withCredentials: false,
        //         //dataType: "json",   //what to return, whereas content-type is what you are sending
        //         //headers: {
        //         //    'Content-Type': 'application/json; charset=utf-8'
        //         //}
        //         //headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        //         //headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
        //     });
        // };


        //=========== PRICELINE: HOTEL ===========//
        dataFactory.autosuggest = function (s) {
            var url = BASEURL_PRICELINE + 'suggested?s=' + s;
            return $http.get(url);
        };
        dataFactory.autosuggestAll = function () {
            var url = vm.env.BASEURL_PRICELINE + 'all';
            var options = { cache: true };
            return $http.get(url, options);
            //return $http.get('https://api.rezserver.com/api/hotel/getAutoSuggestV2?format=json&refid=7760&api_key=c144a93c430ad566bf33bffa4fbb088b&string=dal');
        };

        //directory auto suggest
        dataFactory.searchDirectory = function (searchParams) {
            var url = vm.env.BASEURL_CONTENT + '/Directory/Search?str=' + searchParams.searchString + '&id=' + searchParams.id;
            var options = {
                cache: false,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        };

        //hopsitals auto suggest
        dataFactory.searchHospitals = function(searchParams) {
            var url='https://services1.arcgis.com/Hp6G80Pky0om7QvQ/arcgis/rest/services/Hospitals/FeatureServer/0/query?where=NAME+like+%27' + searchParams.searchString + '%25%27&objectIds=&time=&geometry=&geometryType=esriGeometryEnvelope&inSR=&spatialRel=esriSpatialRelIntersects&resultType=none&distance=0.0&units=esriSRUnit_Meter&returnGeodetic=false&outFields=NAME%2C+CITY%2C+STATE&returnGeometry=true&multipatchOption=xyFootprint&maxAllowableOffset=&geometryPrecision=&outSR=&datumTransformation=&applyVCSProjection=false&returnIdsOnly=false&returnUniqueIdsOnly=false&returnCountOnly=false&returnExtentOnly=false&returnDistinctValues=false&orderByFields=&groupByFieldsForStatistics=&outStatistics=&having=&resultOffset=&resultRecordCount=&returnZ=false&returnM=false&returnExceededLimitFeatures=true&quantizationParameters=&sqlFormat=none&f=pjson&token=';
            var options = {
                cache: false,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        }

        dataFactory.getAutosuggestHotels = function (searchParams) {
            var s = encodeURIComponent(searchParams.f2());  //.searchString);
            var h = true;   //(searchParams.includeHotels)?'true':'false';
            var a = true;   //(searchParams.includeAirports)?'true':'false';
            var c = true;   //(searchParams.includeCities)?'true':'false';
            var url = vm.env.BASEURL_PRICELINE + 'hotels/autosuggest?s=' + s + '&h=' + h + '&a=' + a + '&c=' + c + '&id=' + searchParams.id;
            var options = {
                cache: false,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        };

        dataFactory.getAllAirports = function (searchParams) {
            //var s = encodeURIComponent(searchParams.f2());
            var url = vm.env.BASEURL_PRICELINE + 'airports/all';//?s=' + s + '&id=' + searchParams.id;
            var options = {
                cache: true,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        };

        dataFactory.getSimplifiedAutoSuggest = function (searchParams) {
            var s = encodeURIComponent(searchParams.f2());
            var url = vm.env.BASEURL_PRICELINE + 'autosuggest/search?s=' + s + '&id=' + searchParams.id;
            var options = {
                cache: false,
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        };

        //attempt at multi async call
        dataFactory.multiCall = function (stateManagerLookups, searchParams, fetchesInProcess) {
            var cbs = [];

            Object.keys(stateManagerLookups).forEach(function (key, index) {

                var a = stateManagerLookups[key];

                //do not look up if we have flag to exclude
                if (!a.isIncluded()) {
                    //console.log('datafactory.multicall - excluded: ' + key);
                    return;
                }

                //do not look up if key is already cached
                if (a.isCached(searchParams.f2())) {
                    //console.log('datafactory.multicall - cached: ' + a.key(searchParams.f2()));
                    return;
                }

                //do not look up if fetch in progress from a previous call
                if (a.isFetchInProgress(searchParams.f2())) {
                    //console.log('datafactory.multicall - fetch already in progress: ' + a.key(searchParams.f2()));
                    return;
                }

                if (a.cb) {

                    //set fetch in progress
                    a.setFetchInProgress(searchParams.id, searchParams.f2());

                    //add promise
                    cbs.push(a.cb(searchParams));
                }
            });

            return $q.all(cbs);
        };

        dataFactory.validateSearchHotels = function (params) {
            var cin = utilities.getPricelineFormattedDate(params.checkin);
            var cout = utilities.getPricelineFormattedDate(params.checkout);
            var validateParams = {
                Destination: params.ppnid,
                DestinationType: params.type,
                Checkin: cin,
                Checkout: cout,
                Rooms: params.rooms,
                Adults: params.adults,
                Children: params.children
            };

            if (params.geo) {
                validateParams.Longitude = params.geo.longitude;
                validateParams.Latitude = params.geo.latitude;
            }

            var url = vm.env.BASEURL_PRICELINE + "hotels/validateSearchHotels";

            return $http({
                url: url,
                method: "POST",
                data: validateParams,
                transformRequest: transformRequestAsFormPost,
                withCredentials: false,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                //headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };

        //hotel results page - non-cug
        dataFactory.searchHotels = function (params) {
            var cin = utilities.getUrlSafeDate(params.checkin);
            var cout = utilities.getUrlSafeDate(params.checkout);
            var r = params.rooms;
            var a = params.adults;
            var c = params.children;
            var radius = params.radius;

            var longitude = '';
            var latitude = '';
            if (params.geo) {
                longitude = params.geo.longitude;
                latitude = params.geo.latitude;
            }
            var url = vm.env.BASEURL_PRICELINE + 'hotels/search?ppnid=' + params.ppnid + '&type=' + params.type + '&checkInDate=' + cin + '&checkOutDate=' + cout + '&rooms=' + r + '&adults=' + a + '&children=' + c + '&radius=' + radius + '&longitude=' + longitude + '&latitude=' + latitude + '&cug=false';
            return $http.get(url);
        };

        //hotel results page - cug
        dataFactory.searchCUGHotels = function (params) {
            var cin = utilities.getUrlSafeDate(params.checkin);
            var cout = utilities.getUrlSafeDate(params.checkout);
            var r = params.rooms;
            var a = params.adults;
            var c = params.children;
            var radius = params.radius;

            var longitude = '';
            var latitude = '';
            if (params.geo) {
                longitude = params.geo.longitude;
                latitude = params.geo.latitude;
            }

            var cugsearchType = params.type;
            var cugsearchPPNId = params.ppnid;

            //no poi search for CUG, so go with city
            if (params.type === 'poi') {
                cugsearchType = 'city';
                cugsearchPPNId = params.cityid;
            }

            var url = vm.env.BASEURL_PRICELINE + 'hotels/cugsearch?ppnid=' + cugsearchPPNId + '&type=' + cugsearchType + '&checkInDate=' + cin + '&checkOutDate=' + cout + '&rooms=' + r + '&adults=' + a + '&children=' + c + '&radius=' + radius + '&longitude=' + longitude + '&latitude=' + latitude +'&cug=true';
            return $http.get(url);
        };

        //pulls from ppn service, and used for hotel page
        dataFactory.getHotelDetail = function (params) {
            var cin = utilities.getUrlSafeDate(params.checkin);
            var cout = utilities.getUrlSafeDate(params.checkout);
            var url = vm.env.BASEURL_PRICELINE + 'hotels/details?hid=' + params.hotelid + '&i=' + cin + '&o=' + cout;
            //return $http.get(url);
            return vm.getRequestWithAuthHandler(url);
        };

        //pulls from db, used for review (http://localhost:82/api/hotel/700003218/details)
        dataFactory.getHotelDetails = function (ppnId) {
            var url = vm.env.BASEURL_PRICELINE + 'reference/hoteldetail?ppnid=' + ppnId;
            var options = { cache: false };
            return $http.get(url, options);
        };

        // reviews for a specific hotel
//TODO: should pull from cached review json - https://accessiblego.azureedge.net/data/hotelReviewData.json
        dataFactory.getHotelReviews = function (ppnid) {
            var url = vm.env.BASEURL_PRICELINE + 'review/get?ppnid=' + ppnid
            var options = { cache: false };     //use may change data during session
            return $http.get(url, options);
        };

        // reviews by rType
        dataFactory.getUserReviewsByType = function (rType) {
            var url = vm.env.BASEURL_CRM + '/api/user/getAllByType?rType=' + rType;
            return vm.getRequestWithAuthHandler(url);
        };

        // photos for a specific review
        dataFactory.getHotelReviewPhotos = function (reviewId) {
            var url = vm.env.BASEURL_PRICELINE + 'review/getPhotos?reviewId=' + reviewId;
            var options = { cache: false };     //use may change data during session
            return $http.get(url, options);
        };

        //hotel room rates - non-cug
        dataFactory.getHotelRates = function (params) {
            var cin = utilities.getUrlSafeDate(params.checkin);
            var cout = utilities.getUrlSafeDate(params.checkout);
            var r = params.rooms;
            var a = params.adults;
            var c = params.children;
            var url = vm.env.BASEURL_PRICELINE + 'hotels/rates?hids=' + params.hotelid + '&checkin=' + cin + '&checkout=' + cout + '&rooms=' + r + '&adults=' + a + '&children=' + c;
            return $http.get(url);
        };

        //hotel room rates - cug
        dataFactory.getCUGHotelRates = function (params) {
            return $http({
                url: vm.env.BASEURL_PRICELINE + 'hotels/cugrates',
                method: "POST",
                data: params,
                transformRequest: transformRequestAsFormPost,
                withCredentials: false,
                responseType: "json",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        };

        //hotel request contract - non-cug
        dataFactory.getContract = function (params) {
            return $http({
                url: vm.env.BASEURL_PRICELINE + 'hotels/rc',
                method: "POST",
                data: params,
                transformRequest: transformRequestAsFormPost,
                withCredentials: false,
                responseType: "json",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        };

        //hotel request contract - cug THIS WORKS WITH OPTIONS!
        dataFactory.getCUGContract = function (params) {
            return $http({
                url: vm.env.BASEURL_PRICELINE + 'hotels/cugrates',
                method: "POST",
                transformRequest: transformRequestAsFormPost,
                data: params,
                // withCredentials: false,
                // dataType: "json",
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            });
        };

        dataFactory.getPrivacyPolicy = function () {
            var url = vm.env.BASEURL_PRICELINE + 'hotels/privacypolicy';
            var options = { cache: false };
            return $http.get(url, options);
        };

        dataFactory.getTermsAndConditions = function () {
            var url = vm.env.BASEURL_PRICELINE + 'hotels/termsandconditions';
            var options = { cache: false };
            return $http.get(url, options);
        };

        dataFactory.getHotelBooking = function (params) {
            var url = vm.env.BASEURL_PRICELINE + 'hotel/getBooking?bookingId=' + params.bookingId + '&email=' + params.email + '&c=' + params.c;
            var options = { cache: false };
            return $http.get(url, options);
        };

        //--- ago reference data ---//
        dataFactory.getCountriesAndStates = function () {
            var url = vm.env.cdn + '/data/countries.json';  //var url = vm.env.BASEURL_CRM + '/api/download/countries';
            //todo: create separate environment for dev version(?)
            var options = { cache: true };
            return $http.get(url, options);
        };

        //---- PRICELINE HOTEL REFERENCE DATA ----//
        dataFactory.getCountries = function () {
            var url = vm.env.BASEURL_PRICELINE + 'hotel/ref/countries';
            var options = { cache: true };
            return $http.get(url, options);
        };

        dataFactory.getCarPolicy = function () {
            var url = 'https://api.rezserver.com/api/shared/getPolicy.Car?format=json&refid=7760&api_key=c144a93c430ad566bf33bffa4fbb088b&site_refid=7760';
            var options = { cache: false }; //policy could theoretically change and/or user not closing session
            return $http.get(url, options);
        };

        dataFactory.getParticipatingCUGOrganizations = function () {
            var url = vm.env.BASEURL_CRM + '/api/CugMember/getCugOrganizations';
            var options = {
                cache: true,
                responseType: 'json'
            };
            return $http.get(url,options);
        };

        dataFactory.getBlogs = function () {
            var url = vm.env.blog + '/posts';
            var options = { cache: true };
            return $http.get(url, options);
        };

        dataFactory.getBlogById = function (id) {
            return $http.get(vm.env.blog + '/posts').then(function (resp) {
                var blogs = resp.data && resp.data.posts;
                return _.find(blogs, { ID: parseInt(id) });
            });
        };

        dataFactory.getBlogBySlug = function (slug) {
            return $http.get(vm.env.blog + '/posts').then(function (resp) {
                var blogs = resp.data && resp.data.posts;
                return _.find(blogs, { slug: slug });
            });
        };

        dataFactory.getBlogByTitle = function (title) {
            return $http.get(vm.env.blog + '/posts').then(function (resp) {
                var blogs = resp.data && resp.data.posts;
                for (var j = 0; j < blogs.length; j++) {
                    if (title.trim() === blogs[j].title.trim()) {
                        return blogs[j];
                    }
                }
            });
        };

        dataFactory.searchBlog = function (searchText) {
            return $http.get(vm.env.blog + '/posts').then(function (resp) {
                var blogs = resp.data && resp.data.posts;
                return _.filter(blogs, function (blog) {
                    return blog.title.toLowerCase().includes(searchText.toLowerCase()) > 0 || blog.content.toLowerCase().includes(searchText.toLowerCase()) > 0;  //new RegExp(searchText, 'i'));
                });
            });
        };

        dataFactory.getBlogAuthors = function() {
            var url = vm.env.cdn + '/data/blogAuthors.json';
            return $http({
                url: url,
                method: 'GET',
                cache: true,
                responseType: 'json'   //what to return, whereas content-type is what you are sending
            });

            // var options = {
            //     cache: false,
            //     responseType: 'json'
            // };
            // return $http.get(url, options);
        }

        /////////////////////////////////////////////
        ////////////////// FLIGHTS ////////////////// 
        /////////////////////////////////////////////
        dataFactory.validateSearchFlights = function (params) {

            var validateParams = {
                way: params.way,
                departure_ppnid: params.departure_ppnid,
                departure_type: params.departure_type,
                departure_display: params.departure_display,
                arrival_ppnid: params.arrival_ppnid,
                arrival_type: params.arrival_type,
                arrival_display: params.arrival_display,
                departureDate: utilities.getPricelineFormattedDate(params.departureDate),
                returnDate: utilities.getPricelineFormattedDate(params.returnDate),
                adults: params.adults,
                children: params.children,
                cabin: params.cabin
            };

            var url = vm.env.BASEURL_PRICELINE + "flights/validateSearchFlights";

            return $http({
                url: url,
                method: "POST",
                data: validateParams,
                withCredentials: false,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
                //headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };

        dataFactory.searchFlights = function (params) {
            //var cin = utilities.getUrlSafeDate(params.checkin);
            //var cout = utilities.getUrlSafeDate(params.checkout);
            //var r = params.rooms;

            return $http({
                url: vm.env.BASEURL_PRICELINE + 'flights/search',
                method: 'POST',
                data: params,
                withCredentials: false,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });

            //return $http.get(vm.env.BASEURL_PRICELINE + 'flights/search?ppnid=' + params.ppnid + '&type=' + params.type + '&checkInDate=' + cin + '&checkOutDate=' + cout + '&rooms=' + r);
        };

        dataFactory.searchReturnFlights = function(params) {
            return $http({
                url: vm.env.BASEURL_PRICELINE + 'flights/searchReturnFlights',
                method: 'POST',
                data: params,
                withCredentials: false,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });
        };

        dataFactory.getFlightContract = function (params) {
            return $http({
                url: vm.env.BASEURL_PRICELINE + 'flights/contract',
                method: 'POST',
                data: params,
                withCredentials: false,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/json; charset=utf-8'
                }
            });

            //var url = vm.env.BASEURL_PRICELINE + 'flights/contract?sid='+params.sid+'&ppn_bundle=' + params.ppn_bundle;
            //return $http.get(url);
        };

        dataFactory.getFlightPolicy = function(category) {
            var url = vm.env.BASEURL_PRICELINE + 'flights/ppnPolicy?category='+category;
            return $http.get(url, {
                cache: true
            });
        };

        dataFactory.getFlightFAQ = function() {
            var url = vm.env.BASEURL_PRICELINE + 'flights/ppnFAQ';
            return $http.get(url, {
                cache: true
            });
        };

        dataFactory.getFlightBaggageInfo = function(airlineCode) {

            //var url = vm.env.BASEURL_PRICELINE + 'flights/airlineBaggageDetail?airlineCode='+airlineCode;
            var url = 'https://www.priceline.com/customerservice/kana?question=ext(baggage_fee_' + airlineCode + ')';
            return $http.get(url, {
                cache: true
            });
                        
            //var trustedUrl = $sce.trustAsResourceUrl(url);
            // return $http.get(u, {
            //     //jsonpCallbackParam: 'callback'
            // });

            //var url = 'https://www.priceline.com/customerservice/kana?question=ext(baggage_fee_'+airlineCode+')';
            // return $http({
            //     url: url,
            //     method: 'GET',
            //     cache: false,
            //     dataType: 'json',   //what to return, whereas content-type is what you are sending
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // });
        };

        dataFactory.getFlightBooking = function (params) {
            var url = vm.env.BASEURL_PRICELINE + 'flights/viewBooking?bookingId=' + params.bookingId + '&email=' + params.email + '&c=' + params.c;
            var options = { cache: false };
            return $http.get(url, options);
        };

        /////////////////////////////////////////////
        //////////////////  CARS   ////////////////// 
        /////////////////////////////////////////////
        dataFactory.validateSearchCars = function (params) {

            var validateParams = {
                pickupLocation_ppnid: params.pickupLocation_ppnid,
                pickupLocation_type: params.pickupLocation_type,
                pickupLocation_display: params.pickupLocation_display,
                pickupDate: utilities.getPricelineFormattedDate(params.pickupDate),
                pickupTime: params.pickupTime,
                dropoffLocation_ppnid: params.dropoffLocation_ppnid,
                dropoffLocation_type: params.dropoffLocation_type,
                dropoffLocation_display: params.dropoffLocation_display,
                dropoffDate: utilities.getPricelineFormattedDate(params.dropoffDate),
                dropoffTime: params.dropoffTime
            };

            var url = vm.env.BASEURL_PRICELINE + "cars/validateSearchCars";

            return $http({
                url: url,
                method: "POST",
                data: validateParams,
                transformRequest: transformRequestAsFormPost,
                withCredentials: false,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
                //headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
            });
        };

        dataFactory.searchCars = function (params) {
            //if airport code is present, use that, else cityid
            var pickupCode = (params.pickupLocation_code !== undefined) ? params.pickupLocation_code : params.pickupLocation_ppnid;
            var dropoffCode = (params.dropoffLocation_code !== undefined) ? params.dropoffLocation_code : params.dropoffLocation_ppnid;

            var url = vm.env.BASEURL_PRICELINE;
            url += 'cars/search?sid=' + params.sid;
            url += '&pickup_code=' + pickupCode;
            url += '&pickup_cityid=' + params.pickupLocation_ppnid;
            url += '&pickup_city=' + params.pickupLocation_city;
            url += '&pickup_state=' + params.pickupLocation_state;
            url += '&pickup_country=' + params.pickupLocation_country;
            url += '&pickup_date=' + utilities.getUrlSafeDate(params.pickupDate);
            url += '&pickup_time=' + utilities.getPricelineFormattedTime(params.pickupTime);

            url += '&dropoff_code=' + dropoffCode;
            url += '&dropoff_cityid=' + params.dropoffLocation_ppnid;
            url += '&dropoff_city=' + params.dropoffLocation_city;
            url += '&dropoff_state=' + params.dropoffLocation_state;
            url += '&dropoff_country=' + params.dropoffLocation_country;
            url += '&dropoff_date=' + utilities.getUrlSafeDate(params.dropoffDate);
            url += '&dropoff_time=' + utilities.getPricelineFormattedTime(params.dropoffTime);
            return $http.get(url);
        };

        dataFactory.getCarContract = function (params) {
            var url = vm.env.BASEURL_PRICELINE + 'cars/contract?car_reference_id=' + params.car_reference_id;
            var options = { cache: false };
            return $http.get(url, options);
        };

        dataFactory.getCarBooking = function (params) {
            var url = vm.env.BASEURL_PRICELINE + 'cars/viewBooking?bookingId=' + params.bookingId + '&email=' + params.email + '&c=' + params.c;
            var options = { cache: false };
            return $http.get(url, options);
        };

        //--- sourced from auth0 Management API ---///
        dataFactory.isUserExist = function (email) {
            var url = vm.env.BASEURL_PRICELINE + 'user/isUser?email=' + encodeURIComponent(email);
            var options = { cache: false };
            return $http.get(url, options);
        };


        ///-- ELASTIC --//
        //retrieve POIs by search (use cases: autosugges)
        dataFactory.getPointsOfInterest = function(searchParams) {
            var url = vm.env.BASEURL_CRM + '/api/es/search?token=' + searchParams.searchString;
            var options = {
                cache: true,   //not sure if this cache or cache in where picker is better
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        }

        //retrieve POIs by city ppn id
        dataFactory.getPointsOfInterestByCityPPNId = function(searchParams) {
            var url = vm.env.BASEURL_CRM + '/api/es/search?cityid_ppn=' + searchParams.cityid_ppn;
            var options = {
                cache: false,   //not sure if this cache or cache in where picker is better
                headers: { 'Content-Type': 'application/json; charset=utf-8' }
            };
            return $http.get(url, options);
        }


        ///-- GOOGLE MAP DISTANCE MATRIX --//
        dataFactory.getDrivingDistanceBetween = function() {
            var url = 'https://maps.googleapis.com/maps/api/distancematrix/json?origins=41.43206,-81.38992|-33.86748,151.20699&destinations=36.127485,-115.167169&key=AIzaSyBibkwsrpmNkF3O-cXPHO0tkS-F4ATFbRc';
            var options = {
                cache: false
            };
            return $http.get(url, options);
        }
        




        //-- REQUIRING AUTHORIZATION --//

        //=========== BEGIN: USER DATA MANAGEMENT ===========//
        dataFactory.signout = function() {
            var url = vm.env.BASEURL_CRM + '/api/user/signout';
            return vm.postRequestWithAuthHandler(url);
        };       
        dataFactory.setUserEmail = function(params) {
            var url = vm.env.BASEURL_CRM + '/api/user/setUserEmail';
            return vm.postRequestWithAuthHandler(url, params);
        };
        dataFactory.getUserLocation = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/getUserLocation';
            return vm.getRequestWithAuthHandler(url);
        };
        dataFactory.saveUserLocation = function (params) {
            var url = vm.env.BASEURL_CRM + "/api/user/saveUserLocation";
            return vm.postRequestWithAuthHandler(url, params);
        };
        //not used
        // dataFactory.saveUserName = function (params) {
        //     var url = vm.env.BASEURL_CRM + "/api/user/saveName";
        //     return vm.postRequestWithAuthHandler(url, params);
        // };

        //-- USER PREFERENCES --//
        dataFactory.getUserPreferences = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/getUserPreferences';
            return vm.getRequestWithAuthHandler(url);
        };
        dataFactory.saveUserPreference = function (params) {
            var url = vm.env.BASEURL_CRM + "/api/user/saveUserPreference";
            return vm.postRequestWithAuthHandler(url, params);
        };
        dataFactory.removeUserPreference = function (params) {
            var url = vm.env.BASEURL_CRM + "/api/user/removeUserPreference";
            return vm.postRequestWithAuthHandler(url, params);
        };

        //-- USER BIO --//
        dataFactory.getUserBio = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/getUserBio';
            return vm.getRequestWithAuthHandler(url);
        };
        dataFactory.saveUserBio = function (params) {
            var url = vm.env.BASEURL_CRM + "/api/user/saveUserBio";
            return vm.postRequestWithAuthHandler(url, params);
        };

        //-- USER FAVORITES --//
        dataFactory.getUserFavorites = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/getUserFavorites';
            return vm.getRequestWithAuthHandler(url);
        };
        dataFactory.addUserFavorite = function (params) {
            var url = vm.env.BASEURL_CRM + "/api/user/addUserFavorite";
            return vm.postRequestWithAuthHandler(url, params);
        };
        dataFactory.removeUserFavorite = function (params) {
            var url = vm.env.BASEURL_CRM + "/api/user/removeUserFavorite";
            return vm.postRequestWithAuthHandler(url, params);
        };

        //-- USER BOOKINGS --//
        dataFactory.getUserBookings = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/getUserBookings';
            return vm.getRequestWithAuthHandler(url);
        };

        //-- USER REVIEWS --//
        dataFactory.getUserReviews = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/getUserReviews';
            return vm.getRequestWithAuthHandler(url);
        };

        //-- BOOKINGS --//
        dataFactory.bookHotel = function (params) {
            var url = vm.env.BASEURL_PRICELINE + 'hotels/book';
            return vm.postRequestWithAuthHandler(url, params);

            // return $http({
            //     url: BASEURL_PRICELINE + 'hotels/book',
            //     method: "POST",
            //     data: params,
            //     transformRequest: transformRequestAsFormPost,
            //     withCredentials: false,
            //     dataType: "json",
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // });
        };

        dataFactory.cancelBooking = function (params) {
            var url = vm.env.BASEURL_PRICELINE + 'hotels/cancelbooking';
            return vm.postRequestWithAuthHandler(url, params);

            // return $http({
            //     url: BASEURL_PRICELINE + 'cancelbooking',
            //     method: "POST",
            //     data: params,
            //     withCredentials: false,
            //     dataType: "json",
            //     headers: {
            //         'Content-Type': 'application/json; charset=utf-8'
            //     }
            // });
            //return $http.post(BASEURL_PRICELINE + 'cancelbooking/', params.ppn_bundle);
        };

        dataFactory.getHotelReview = function (ppnId, custId) {
            var url = vm.env.BASEURL_PRICELINE + 'hotel/getReview?ppnid=' + ppnId + '&customerid=' + custId;
            return vm.getRequestWithAuthHandler(url);
        };

        dataFactory.submitHotelReview = function (reviewHotelParams) {
            //var url = vm.env.BASEURL_PRICELINE + 'reference/addHotelreview';
            //return vm.postRequestWithAuthHandler(url, reviewHotelParams);

            return $http({
                url: vm.env.BASEURL_PRICELINE + 'reference/addHotelreview',
                method: "POST",
                data: reviewHotelParams,
                //transformRequest: transformRequestAsFormPost,
                withCredentials: false,
                responseType: "json",
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + vm.getAccessToken(),
                }
            });
        };

        dataFactory.getDirectoryEntryReview = function (id, custId) {
            //var url = vm.env.BASEURL_PRICELINE + 'directory/' + id + '/review/' + custId;
            var url = vm.env.BASEURL_PRICELINE + 'reference/GetDirectoryEntryReview?id=' + id + '&customerid=' + custId;
            return vm.getRequestWithAuthHandler(url);
        };
        dataFactory.submitDirectoryEntryReview = function (reviewDirectoryEntryParams) {
            var url = vm.env.BASEURL_PRICELINE + 'reference/addDirectoryReview';
            return vm.postRequestWithAuthHandler(url, reviewDirectoryEntryParams);

            // return $http({
            //     url: vm.env.BASEURL_PRICELINE + 'reference/addDirectoryReview',
            //     method: "POST",
            //     data: reviewDirectoryEntryParams,
            //     transformRequest: transformRequestAsFormPost,
            //     withCredentials: false,
            //     dataType: "json",
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded',
            //     }
            // });
        };

        dataFactory.getCustomerCugDetails = function () {
            var url = vm.env.BASEURL_CRM + '/api/CugMember/getCugDetails';
            var options = { cache: false };
            return vm.getRequestWithAuthHandler(url, options);
            // var config = {
            //     cache: false,
            //     headers: {
            //         //"Authorization": "Bearer " + accessToken,
            //         'Content-Type': 'application/json; charset=utf-8'
            //     },
            //     //withCredentials: true,
            //     dataType: "json",
            // };
            // return $http.get(url,config);
        };


        dataFactory.submitCugParkingId = function (params) {
            var url = vm.env.BASEURL_CRM + '/api/CugMember/SubmitParkingVerification';
            return vm.postRequestWithAuthHandler(url, params);
        };

        dataFactory.submitCugOrganizationId = function (params) {
            var url = vm.env.BASEURL_CRM + '/api/CugMember/SubmitOrganizationVerification';
            return vm.postRequestWithAuthHandler(url, params);
        };

        dataFactory.checkAndEnroll = function(params) {
            var url = vm.env.BASEURL_CRM + '/api/CugMember/checkAndEnroll';
            return vm.postRequestWithAuthHandler(url, params);
        };

        dataFactory.updateActiveCampaign = function () {
            if (vm.env.name === 'development') return;

            var params = {
                emailAddress: localStorageService.getUserProfile().email
            };
            var url = vm.env.BASEURL_CRM + '/api/CugMember/SetActiveCampaignUserStatusApplied';
            return vm.postRequestWithAuthHandler(url, params);
        };

        dataFactory.bookFlight = function (flightBookServiceParams) {
            var url = vm.env.BASEURL_PRICELINE + 'flights/book';

            //would use postRequestWithAuthHandler but need content-type of json
            //return vm.postRequestWithAuthHandler(url, flightBookServiceParams);
            return $http({
                url: url,
                method: "POST",
                data: flightBookServiceParams,
                //transformRequest: transformRequestAsFormPost,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + vm.getAccessToken(),
                }
            });
        };

        dataFactory.bookCar = function (carBookServiceParams) {
            var url = vm.env.BASEURL_PRICELINE + 'cars/book';
            return vm.postRequestWithAuthHandler(url, carBookServiceParams);

            // return $http({
            //     url: BASEURL_PRICELINE + 'cars/book',
            //     method: "POST",
            //     data: carBookServiceParams,
            //     transformRequest: transformRequestAsFormPost,
            //     withCredentials: false,
            //     dataType: "json",
            //     headers: {
            //         'Content-Type': 'application/x-www-form-urlencoded'
            //     }
            // });
        };

        //TODO:
        // dataFactory.cancelCarBooking = function(params) {
        //     return $http({
        //         url: BASEURL_PRICELINE + 'cancelbooking',
        //         method: "POST",
        //         data: params,
        //         withCredentials: false,
        //         dataType: "json",
        //         headers: {
        //             'Content-Type': 'application/json; charset=utf-8'
        //         }
        //     });
        //     //return $http.post(BASEURL_PRICELINE + 'cancelbooking/', params.ppn_bundle);
        // };

        dataFactory.IsUserPermitExist = function () {
            var url = vm.env.BASEURL_CRM + '/api/user/isUserHavePermit';
            return vm.getRequestWithAuthHandler(url);
        };

        dataFactory.UploadUserPermit = function (params) {
            var url = vm.env.BASEURL_CRM + '/api/user/uploadPermit';
            //  return vm.postRequestWithAuthHandler(url,parms);

            return $http({
                url: url,
                method: "POST",
                data: params,
                //transformRequest: transformRequestAsFormPost,
                cache: false,
                //dataType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': undefined,
                    'Authorization': 'Bearer ' + vm.getAccessToken(),
                },
                responseType: "json",
                transformRequest: angular.identity
            });

            // return $http({
            //     url: url,
            //     method: "POST",
            //     data: params,
            //     transformRequest: transformRequestAsFormPost,
            //     cache: false,
            //     //dataType: "json",   //what to return, whereas content-type is what you are sending
            //     headers: {
            //         'Content-Type': 'multipart/form-data;',
            //         'Authorization': 'Bearer ' + vm.getAccessToken(),
            //     }
            // });
        };

        dataFactory.sendVerificationEmail = function () {
            var url = vm.env.BASEURL_PRICELINE + 'user/sendVerificationEmail';
            return vm.getRequestWithAuthHandler(url);
        };





        //-- TO BE DEPRECATED --//

        //authorization
        dataFactory.test = function (username, pass) {
            return $http.get($scope.ENVIRONMENT + '/Account/Test');
            //return $http.post('http://localhost:3000/Account/Login',{ username: username, password: pass});
        };

        //email
        //TODO: figure out if there is a global way to pass in environment, since a factory is supposed to be $scope agnostic
        dataFactory.SendEmail = function (environment, data) {
            return $http.post(environment + "/Email/Join", data);
        };

        // dataFactory.signUp = function (email) {
        //     var url = vm.env.BASEURL_CRM + '/api/email/add?emailAddress=' + email;
        //     //var data = { 'emailAddress': email };
        //     //data =  "emailAddress=" + email
        //     // return $http({
        //     //     method: 'GET',
        //     //     url: url,
        //     //     //data: data,
        //     //     headers: {'Content-Type': 'application/json'}
        //     // });

        //     //var config = { 'Content-Type': 'application/json' };
        //     return $http.get(url);
        // };

        // dataFactory.getAutosuggestAirports = function (searchParams) {
        //     var s = encodeURIComponent(searchParams.f2());
        //     var url = vm.env.BASEURL_PRICELINE + 'airports/search?s=' + s + '&id=' + searchParams.id;
        //     var options = {
        //         cache: false,
        //         headers: { 'Content-Type': 'application/json; charset=utf-8' }
        //     };
        //     return $http.get(url, options);
        // };

        // dataFactory.getAutosuggestCities = function (searchParams) {
        //     var s = encodeURIComponent(searchParams.f2());
        //     var url = vm.env.BASEURL_PRICELINE + 'cities/search?s=' + s + '&id=' + searchParams.id;
        //     var options = {
        //         cache: false,
        //         headers: { 'Content-Type': 'application/json; charset=utf-8' }
        //     };
        //     return $http.get(url, options);
        // };

        // dataFactory.getAirAutoComplete = function(airAutocompleteParams) {
        //     var url = 'https://api.rezserver.com/api/air/getAutoComplete?format=json&refid=7760&api_key=c144a93c430ad566bf33bffa4fbb088b&string=' + airAutocompleteParams.searchString;
        //     return $http.get(url);
        // };

        // dataFactory.getStates = function () {
        //     return ('AL AK AZ AR CA CO CT DE FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS ' +
        //         'MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI ' +
        //         'WY').split(' ').map(function (state) {
        //             return { abbrev: state };
        //         });
        // };

        // dataFactory.getBlogByBloggers = function (user) {
        //     return $http.get(vm.env.blog + '/posts').then(function (resp) {
        //         var blogs = resp.data && resp.data.posts;
        //         var user = {
        //             name: 'John Doe',
        //             about: 'Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry\'s standard dummy' +
        //                 ' text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.',
        //             email: 'jdoe123@gmail.com',
        //             image_url: 'http://keenthemes.com/preview/metronic/theme/assets/pages/media/profile/profile_user.jpg',
        //             facebook: '',
        //             website: '',
        //             rss: ''
        //         };
        //         return {
        //             blogs: blogs,
        //             user: user
        //         };
        //     });
        // };



        //--- HELPERS ---//
        function getAccessToken() {
            return localStorageService.getAccessToken();
        }

        function getIdToken() {
            return localStorageService.getIdToken();
        }

        function getRequestWithAuthHandler(url, params) {
            return $http({
                url: url,
                method: 'GET',
                data: params,
                cache: false,
                responseType: 'json',   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                    'Authorization': 'Bearer ' + vm.getAccessToken()
                }
            });
        }

        function postRequestWithAuthHandler(url, params) {
            return $http({
                url: url,
                method: "POST",
                data: params,
                transformRequest: transformRequestAsFormPost,
                cache: false,
                responseType: "json",   //what to return, whereas content-type is what you are sending
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'Authorization': 'Bearer ' + vm.getAccessToken(),
                }
            });
        }


        return dataFactory;
    };

    dataFactory.$inject = ['$http', 'utilities', '$q', 'transformRequestAsFormPost', 'localStorageService', 'environmentService', '$sce'];
    mod.factory('dataFactory', dataFactory);
};
