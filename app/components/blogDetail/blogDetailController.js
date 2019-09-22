module.exports = function(app) {
    var blogDetailController = function ($rootScope, $state, metaTagService, $stateParams, dataFactory, blog, utilities, localStorageService, environmentService) {
        require("./blogDetail.less");
        var vm = this;
        vm.env = environmentService();
        vm.blogs = [];
        vm.breadcrumbs = [];

        vm.getDate = getDate;
        vm.getImageUrl = getImageUrl;
        vm.blog = blog;
        vm.init = init;
        vm.getFilterBlogs = getFilterBlogs;
        //vm.setupMUUT = setupMUUT;
        vm.setupMetaTags = setupMetaTags;
        vm.onChangeBloggerList=onChangeBloggerList;
        
        
        vm.init();

        function decodeHtml(html) {
            var txt = document.createElement("textarea");
            txt.innerHTML = html;
            return txt.value;
        }

        function init() {

            //set breadcrumbs
            vm.breadcrumbs = [
                { isActive: false, title: 'Travel Ideas', state: 'travel-ideas' },
                { isActive: true, title: 'Travel Blogs' }
            ];

            //hack until we go live with authors on wordpress side
            //vm.authorData = dataFactory.temporaryAuthorData;
            dataFactory.getBlogAuthors().then(function(res) {
                vm.authorData = res.data.blogAuthors;

                //get author data
                for (var j=0;j<vm.authorData.length;j++) {
                    //vm.blog.featured_image = '';
                    //test this
                    for (var k=0;k<vm.authorData[j]["Article Titles"].length;k++) {
                        if (vm.blog.title.trim() === vm.authorData[j]["Article Titles"][k].trim()) {
                            vm.blog.author = vm.authorData[j];
                            vm.blog.author.name = vm.authorData[j].first_name + ' ' + vm.authorData[j].last_name;
                            vm.blog.author.featured_image = vm.authorData[j].featured_image;
                            break;
                        }
                    }
                }

                //setup meta tags
                vm.setupMetaTags();

                //setup muut after dom loads
                // angular.element(document).ready(function() {
                //     vm.setupMUUT();
                // });

                dataFactory.getBlogs().then(function (res) {
                   vm.blogs = res && res.data && res.data.posts;
                });
            });
        }

        function getDate() {
            return dateFns.format(vm.blog.date, 'MMMM Do YYYY, h:mm a');
        }

        function onChangeBloggerList(selectedAuthor){
            if (!selectedAuthor || selectedAuthor === '') return;
            $state.go('blogAuthor', { lastname: selectedAuthor.replace('.','') });
        }

        function getImageUrl() {
            return vm.blog.author.featured_image;

            // var element = angular.element(blogData.content);
            // var id = element.find('img').attr('data-attachment-id');
            // return blogData.attachments[id] &&
            // blogData.attachments[id].thumbnails &&
            // blogData.attachments[id].thumbnails.thumbnail;
        }

        function getFilterBlogs(blogs) {
            vm.blogs = blogs;
        }

        //TODO: make this a service - you have similar code in articlesController
        //MUUT comments
        // function setupMUUT() {
        //     var successMuutFunc = function(response) {
        //         var config = {
        //             url: 'https://muut.com/i/accessiblego/comments/' + vm.blog.title,

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
        //             login_url: vm.env.BASEURL_CRM + '/signin',

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
        //     var errMuutFunc = function(response) {
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

        //     dataFactory.setupMUUT(params).then(successMuutFunc,errMuutFunc);
        // }

        function setupMetaTags() {

            //title
            var title = vm.blog.title;  //var decodedTitle = decodeHtml(vm.blog.title);
            
            //desc
            var idxAtEndOfSecondSentence = utilities.getNthIndex(vm.blog.author.bio,'.',2);
            var twoSentences = vm.blog.author.bio.substring(0,idxAtEndOfSecondSentence+1);
            twoSentences = twoSentences.replace('<p>','');
            twoSentences = twoSentences.replace('</p>','');

            //img
            var img = vm.blog.featured_image + '&Size=medium';

            $rootScope.metaTagService.setup({
                metaTitle: title,
                metaDescription: twoSentences,
                ogType: 'article',
                ogTitle: title,
                ogDescription: twoSentences,
                ogImage: img,
                twitterTitle: title,
                twitterDescription: twoSentences,
                twitterImage: img,
                twitterImageAlt: title
            });
        }
    };

    blogDetailController.$inject = ['$rootScope','$state','metaTagService', '$stateParams', 'dataFactory', 'blog', 'utilities', 'localStorageService', 'environmentService'];
    app.controller('blogDetailController', blogDetailController);
};
