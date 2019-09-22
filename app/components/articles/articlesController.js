module.exports = function (app) {
    var articlesController = function ($rootScope, $scope, $stateParams, dataFactory, $filter, metaTagService, $location, $state, $window, localStorageService, utilities, environmentService, reviewService) {
        var vm = this;
        vm.init = init;
        vm.parseJsonDate = parseJsonDate;
        //vm.articleid = $stateParams.aid;
        vm.title = $stateParams.title;
        vm.formatDescription = formatDescription;
        vm.formatText = formatText;
        vm.articleboxes = [];
        vm.cityoptions = [];
        //vm.setupMUUT = setupMUUT;

        vm.env = environmentService();

        //load different city
        vm.goToOtherCity = goToOtherCity;

        vm.submitReview = submitReview;
        vm.addRemoveCancelBtn = addRemoveCancelBtn;
        vm.getTravelDate = getTravelDate;

        //initizalization
        vm.init();

        //required
        require("./articles.less");
        // require("../../../resources/vendors/muut/css/moot.css")
      
        //function definition
        function init() {

            //get cities
            //deprecating this approach in favor of $http cache below
            //$rootScope.$watch('cities', function (newVal, oldVal) {
            //    vm.cityoptions = $rootScope.cities;
            //});
            var getAllCitiesSuccess = function success(response) {
                vm.cityoptions = response.data;
            };
            var getAlLCitiesError = function error(response) { console.log('no city data found'); };
            dataFactory.getAllCities().then(getAllCitiesSuccess,getAlLCitiesError);

            //cities
            // $rootScope.$watch('cities', function(newVal,oldVal) {
            //     vm.cities = $rootScope.cached_cities;
            // });


            //get article data
            var successFunc = function (response) {
                vm.article = response.data;

                console.log(vm.article);


                vm.articleboxFilter = vm.article.City.Id;

                //get data from localstorage
                var userReviews = localStorageService.getUserReviews();

                var getArticleEntries = vm.article.ArticleEntries;

                getArticleEntries = getArticleEntries.map( function(item, index) {
                    var isArticleEntryHaveReview = userReviews.filter( function(i) {
                        // if (!i.directory) return false;
                        // return i.directory.directoryId == item.DirectoryId;
                        return i.directoryEntryId == item.DirectoryId || i.ppnid == item.ppnId;
                    });

                    item.reviewUser = {};
                    if (isArticleEntryHaveReview.length) {
                        item.reviewUser.rating = isArticleEntryHaveReview[0].rating;
                        item.reviewUser.tittle_Review = isArticleEntryHaveReview[0].title;
                        item.reviewUser.data_Review = isArticleEntryHaveReview[0].description;
                        var travelDate = isArticleEntryHaveReview[0].travelDate;
                        if (travelDate) {
                            item.reviewUser.travelDate = new Date(vm.getTravelDate(travelDate));
                        }
                        // item.reviewUser.isFormDisable = true;
                        //why is this being overwritten?
                        //item.numUserReviews = isArticleEntryHaveReview[0].numUserReviews;
                    }
                    else {
                        item.reviewUser.rating = 0;
                        item.reviewUser.errs = [];
                        //   item.reviewUser.isVisibleForm = false;
                        //   item.reviewUser.isFormDisable = false;
                        //   item.afterCreatedReview = false;
                    }
                    return item;
                });

                setTimeout(function () {
                    var clonedHeaderRow;
                    $(".persist-area").each(function () {
                        clonedHeaderRow = $(".persist-header", this);
                        clonedHeaderRow
                            .before(clonedHeaderRow.clone(true))
                            .css("width", clonedHeaderRow.width())
                            .addClass("floatingHeader");
                        clonedHeaderRow[0].getElementsByClassName('review_stickyheader')[0].style.display = "block";

                    });
                }, 2);


                //vm.author = data.Author;
                //vm.published = parseJsonDate(data.Published);

                //setup meta tags
                var img = vm.env.BASEURL_CONTENT + '/Image/GetImage?assetId=' + vm.article.IntroImage.Id + '&Size=medium';
                var idxAtEndOfSecondSentence = utilities.getNthIndex(vm.article.IntroText, '.', 2);
                var twoSentences = vm.article.IntroText.substring(0, idxAtEndOfSecondSentence + 1);
                var authorName = vm.article.Author.FName;
                if (vm.article.Author.LName) {
                    authorName+= ' ' + vm.article.Author.LName;
                }
                twoSentences = twoSentences.replace('<p>', '');
                twoSentences = twoSentences.replace('</p>', '');
                $rootScope.metaTagService.setup({
                    metaTitle: vm.article.Title,
                    metaDescription: twoSentences,
                    ogType: 'article',
                    ogTitle: vm.article.Title,
                    ogDescription: twoSentences,
                    ogImage: img,
                    twitterTitle: vm.article.Title,
                    twitterDescription: twoSentences,
                    twitterImage: img,
                    twitterImageAlt: vm.article.Title,
                    breadcrumbJson: [{
                      type: 'ListItem',
                      position: 2,
                      name: 'Articles',
                      item: 'https://accessibleGO.com/ideas'
                    }],
                    articleJson: {
                      "@context": "http://schema.org",
                      "@type": "NewsArticle",
                      mainEntityOfPage: {
                        "@type": "WebPage",
                        "@id": "https://google.com/article"
                      },
                      headline: vm.article.Title,
                      image: [
                        img,
                      ],
                      "datePublished": vm.parseJsonDate(vm.article.Published),
                      "dateModified": vm.parseJsonDate(vm.article.Published),
                      "author": {
                        "@type": "Person",
                        "name": authorName
                      },
                      publisher: {
                        "@type": "Organization",
                        "name": "accessibleGO",
                        "logo": {
                          "@type": "ImageObject",
                          url: "https://accessiblego.azureedge.net/logos/logo_500_116_black.png"
                        }
                      },
                      description: twoSentences
                    }
                });

                /* OLD
                    //meta tags
                    $rootScope.setMetaTitle(vm.article.Title);
                    $rootScope.setMetaDescription(vm.article.IntroText);

                    //facebook open graph
                    $rootScope.metaTagService = metaTagService;
                    var newMetaUrl = $location.absUrl() ;
                    var newMetaType = 'article';
                    var newMetaTitle = vm.article.Title;
                    var newMetaDescription = vm.article.IntroText;
                    var newMetaImage = vm..env.BASEURL_CONTENT +'/Image/GetImage?assetId=' + vm.article.IntroImage.Id + '&Size=medium';
                    $rootScope.metaTagService.set(newMetaUrl, newMetaType, newMetaTitle, newMetaDescription, newMetaImage);
                */

            };
            var errFunc = function (response) {
                console.log('no article data found');
            };
            dataFactory.getArticleByTitle(vm.title).then(successFunc, errFunc);

            //side article boxes
            var sFunc = function (response) {

                vm.articleboxes = response.data;
            };
            var eFunc = function (response) { console.log('no article data found'); };
            dataFactory.getAllArticles().then(sFunc, eFunc);

            //setup muut after dom loads
            // angular.element(document).ready(function () {
            //     vm.setupMUUT();
            // });

            //callback for twitter button click
            angular.element(document).ready(function () {

            });

        }

        function getTravelDate(date_string) {
            date_string = date_string.split('');
            date_string.splice(2, 0, "1/");
            return date_string.join('');
        }

        function submitReview(type, articleEntry, index) {
            var rtype = 'd';
            if (type.Flag === 'h') rtype = 'h';

            var params = {
                //set in dataFactory custId: localStorageService.getCustomerId(),
                rtype: rtype,
                directoryEntryId: articleEntry.DirectoryId,
                ppnId: articleEntry.ppnId,
                rating: articleEntry.reviewUser.rating,
                title: articleEntry.reviewUser.tittle_Review,
                description: articleEntry.reviewUser.data_Review,
                articleId: articleEntry.ArticleId,
                articleEntryId: articleEntry.Id
            };

            //accessibility
            if (articleEntry.reviewUser.suitability) {
                params.accWheelchairUsers = articleEntry.reviewUser.suitability.accWheelchairUsers;
                params.accLowVision = articleEntry.reviewUser.suitability.accLowVision;
                params.accLowHearing = articleEntry.reviewUser.suitability.accLowHearing;
                params.accLowMobility = articleEntry.reviewUser.suitability.accLowMobility;

                //for hotels only
                if (rtype == 'h') {
                    params.entranceandmainareas = articleEntry.reviewUser.suitability.entranceAndMainAreas;
                    params.parking = articleEntry.reviewUser.suitability.parking;
                    params.elevator = articleEntry.reviewUser.suitability.elevator;
                    params.restaurant = articleEntry.reviewUser.suitability.restaurant;
                    params.room = articleEntry.reviewUser.suitability.room;
                    params.pool = articleEntry.reviewUser.suitability.pool;
                    params.fitnesscenter = articleEntry.reviewUser.suitability.fitnessCenter;
                    params.businesscenter = articleEntry.reviewUser.suitability.businessCenter;
                }
            }

            //travel date
            var travelDate = articleEntry.reviewUser.travelDate;
            if (travelDate) {
                var travelDateMonth = travelDate.getMonth() + 1;
                var travelDateYear = travelDate.getFullYear();
                params.travelDate = travelDateMonth + '/' + travelDateYear;
            }

            // var postAuthRedirectParams = {
            //     to: 'reviewEntry',
            //     params: { id: vm.id }
            // };

            var validationCB = function (errors) {
                console.log(errors);
                articleEntry.reviewUser.errs = errors.errors;
            };

            var submissionCB = function (r) {
                if (!r.success) {
                    console.log(r);
                    articleEntry.reviewUser.errs = r.data;
                    return;
                    //handle error case here :: show error message on the bottom of the in-line article entry form.
                }

                //success
                articleEntry.numUserReviews++;// = r.data;
                articleEntry.reviewUser.errs = [];
                vm.addRemoveCancelBtn(index, 'postData', articleEntry);

                //cannot review again!
                vm.hasUserAlreadyReviewed(articleEntry);
            };

            reviewService.submit(params, validationCB, submissionCB);   //, postAuthRedirectParams);
        }


        function addRemoveCancelBtn($index, btnType, articleEntry) {
            if (btnType == 'addbtn') {
                articleEntry.reviewUser.isVisibleForm = true;
                articleEntry.afterCreatedReview = false;
            }
            if (btnType == 'removeBtn') {
                articleEntry.reviewUser.isVisibleForm = false;
            }
            if (btnType == 'postData') {
                articleEntry.reviewUser.isVisibleForm = false;
                // articleEntry.reviewUser.isFormDisable = true;
                articleEntry.afterCreatedReview = true;
            }

        }


        $(window)
            .scroll(UpdateTableHeaders)
            .trigger("scroll");


        function UpdateTableHeaders() {
            $(".persist-area").each(function () {
                var el = $(this),
                    offset = el.offset(),
                    scrollTop = $(window).scrollTop(),
                    floatingHeader = $(".floatingHeader", this);

                if ((scrollTop > offset.top) && (scrollTop < offset.top + el.height())) {
                    floatingHeader.css({
                        "visibility": "visible"
                    });
                } else {
                    floatingHeader.css({
                        "visibility": "hidden"
                    });
                }
            });
        }

        function parseJsonDate(jsonDate) {
            if (!jsonDate || jsonDate === 'undefined') return;

            var x = [
                { "id": 1, "start": "\/Date(" + jsonDate + ")\/" },
                { "id": 2, "start": "\/Date(" + jsonDate + ")\/" }
            ];
            var myDate = new Date(x[0].start.match(/\d+/)[0] * 1);

            var monthNames = [
                "Jan", "Feb", "Mar",
                "Apr", "May", "Jun", "Jul",
                "Aug", "Sep", "Oct",
                "Nov", "Dec"
            ];

            var day = myDate.getDate();
            var monthIndex = myDate.getMonth();
            var year = myDate.getFullYear();

            return monthNames[monthIndex] + ' ' + day + ' ' + year;

            //return myDate;
        }

        function formatText(text) {
            if (!text) return;
            //text = text.replace(/<p>&nbsp;<[/]p>/gi, "");
            return text
                //.replace(/(?:\r\n|\r|\n)/g, '<br />')
                //.replace("<p>", '')
                .replaceAll("<a ", "<a target='newWindow' ");
        }

        String.prototype.replaceAll = function (search, replacement) {
            var target = this;
            return target.replace(new RegExp(search, 'g'), replacement);
        };

        vm.replaceSpacesWithUnderscores = replaceSpacesWithUnderscores;
        function replaceSpacesWithUnderscores(txt) {
            if (!txt) return;
            return txt.replaceAll(" ", "_");
        }

        vm.getFacebookDataRef = getFacebookDataRef;
        function getFacebookDataRef(articleTitle) {
            if (!articleTitle) return;
            return 'https://accessiblego.com/articles/' + replaceSpacesWithUnderscores(articleTitle);
        }

        vm.getFacebookShareLink = getFacebookShareLink;
        function getFacebookShareLink(articleTitle) {
            return 'https://www.facebook.com/sharer/sharer.php?u=https%3A%2F%2Faccessiblego.com%2Farticles%2F' +
                replaceSpacesWithUnderscores(articleTitle) + '&amp;src=sdkpreparse';
        }

        function formatDescription(description) {
            return $filter('parseUrlFilter')(description);
        }

        function goToOtherCity() {
            if (!vm.selectedCity || vm.selectedCity === '') return;
            $state.go('city', { name: vm.selectedCity.replace(' ', '_') });
        }

        //MUUT comments
        // function setupMUUT() {
        //     var successMuutFunc = function (response) {
        //         var config = {
        //             url: 'https://muut.com/i/accessiblego/comments/' + vm.title,

        //             //custom title for the single thread when used for flat commenting.
        //             //displayed in your forum only, not on the commenting pages.
        //             //default: taken from document.title.
        //             //do not use the data- prefix when passed as an HTML attribute.
        //             //title: '',

        //             //Specifies a custom title for the channel that contains the thread. By default this is taken from the path.
        //             //channel: '',

        //             //Specifies whether individual thread titles are shown in a multi-thread comment section. When set to false, the title field will be unavailable upon creating new threads. In addition, threads are never collapsed.
        //             show_title: true,

        //             //Specifies whether the list of online users is shown.
        //             show_online: false,

        //             //Specifies whether sharing buttons (twitter, facebook…) are shown on the client.
        //             share: true,

        //             //False configuration property displays a “Watch for new replies”- checkbox when replying or creating new topics.
        //             //default: true, threads are automatically followed
        //             //On both cases users have the option to click the eye icon to follow/unfollow threads.
        //             autowatch: true,   //false=sets watch to true (?)

        //             //False configuration property forces the autowatch checkbox to be unchecked by default.
        //             autowatch_checked: false,

        //             //Specifies whether image uploading is enabled for users.
        //             upload: false,

        //             //Let's the system know you're using Federated ID. Be sure to do the rest of the work! See our page on FedID
        //             sso: true,

        //             //In a Federated Identities setup, determines where users are sent to login from the embed.
        //             login_url: '/articles/' + $stateParams.title + '/muut_login',  // + encodeURIComponent('articles/'+$stateParams.title),

        //             //signed embeds (required for federated identities - you must keep auto-init disabled ie no class "muut")
        //             api: {
        //                 // API key for "accessiblego"- community
        //                 key: 'hT8euLfdVi',

        //                 // generate following on the server side (see below)
        //                 message: response.data.message,
        //                 signature: response.data.signature,
        //                 timestamp: response.data.timestamp
        //             }
        //         };

        //         $('#muut_accessiblego').muut(config);
        //     };
        //     var errMuutFunc = function (response) {
        //         console.log('error while setting up MUUT: ' + response);
        //     };

        //     //todo: this is from google profile, confirm that facebook and non-social have same parameters
        //     //todo: centralize where we get/set/remove items from localstorage
        //     //todo: would it be better to simply pass the userProfile to setupMUUT?
        //     var params = {};
        //     //var userProfile = JSON.parse(localStorage.getItem('profile')) || null;
        //     var userProfile = localStorageService.getUserProfile() || null;
        //     if (userProfile) {
        //         params.id = userProfile.customerId;
        //         params.email = userProfile.email;
        //         params.name = userProfile.name;
        //         params.avatar = userProfile.picture;
        //     }

        //     params = JSON.parse(JSON.stringify(params));

        //     dataFactory.setupMUUT(params).then(successMuutFunc, errMuutFunc);
        // }

        vm.popupTwitterShareWindow = popupTwitterShareWindow;
        function popupTwitterShareWindow() {
            var text = encodeURIComponent(vm.title).replaceAll("_", " ");
            var width = 575,
                height = 400,
                left = ($window.innerWidth - width) / 2,
                top = ($window.innerHeight - height) / 2,
                url = 'https://twitter.com/share?text=' + text + '&url=' + vm.getFacebookDataRef(vm.title),
                opts = 'status=1' +
                    ',width=' + width +
                    ',height=' + height +
                    ',top=' + top +
                    ',left=' + left;

            $window.open(url, 'twitter', opts);
        }

        vm.popupFacebookShareWindow = popupFacebookShareWindow;
        function popupFacebookShareWindow() {
            var text = encodeURIComponent(vm.title).replaceAll("_", " ");
            var width = 575,
                height = 400,
                left = ($window.innerWidth - width) / 2,
                top = ($window.innerHeight - height) / 2,
                url = vm.getFacebookShareLink(vm.title),
                opts = 'status=1' +
                    ',width=' + width +
                    ',height=' + height +
                    ',top=' + top +
                    ',left=' + left;

            $window.open(url, 'twitter', opts);
        }

        vm.hasUserAlreadyReviewed = hasUserAlreadyReviewed;
        function hasUserAlreadyReviewed(entry) {
            if (!localStorageService.getAuthenticationState()) return false;
            var userReviews = localStorageService.getUserReviews();
            var hasBeenReviewed = false;
            $.each(userReviews,function(idx,review) {
                //if (!review.directory) return true;
                //if (review.directory.directoryId===directoryEntryId) {
                if (review.directoryEntryId == entry.DirectoryId || review.ppnId == entry.ppnId) {
                    hasBeenReviewed = true;
                    return false;
                }
            });
            return hasBeenReviewed;
        }

    };

    articlesController.$inject = ['$rootScope', '$scope', '$stateParams', 'dataFactory', '$filter', 'metaTagService', '$location', '$state', '$window', 'localStorageService', 'utilities', 'environmentService', 'reviewService'];
    app.controller('articlesController', articlesController);
};
