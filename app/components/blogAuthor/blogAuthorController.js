module.exports = function(app) {
    var blogAuthorController = function ($rootScope,$stateParams, dataFactory, blog,$state, utilities) {
        require("./blogAuthor.less");
        var vm = this;
        vm.getDate = getDate;
        vm.getImageUrl = getImageUrl;
        vm.blog = blog;
        vm.init = init;
        vm.blogs = [];
        vm.setupMetaTags = setupMetaTags;
        vm.addAuthorData = addAuthorData;
        vm.onChangeBloggerList=onChangeBloggerList;

        vm.init();

        function init() {
            //hack until we go live with authors on wordpress side
            //vm.authorData = dataFactory.temporaryAuthorData;
            dataFactory.getBlogAuthors().then(function(res) {
                vm.authorData = res.data.blogAuthors;
            });            

            //get article data
            dataFactory.getBlogByTitle(vm.blog["Article Titles"][0]).then(function (blog) {
                vm.articles = [blog];
            });

            //setup meta tags
            vm.setupMetaTags();
            
            dataFactory.getBlogs().then(function (res) {
               vm.blogs = res && res.data && res.data.posts;

               //hack until authors get on wordpress
               vm.addAuthorData();
            });

            //get author data
            // for (var j=0;j<vm.authorData.length;j++) {
            //     vm.blog.featured_image = '';
            //     if (vm.blog.title.substring(1,5) === vm.authorData[j]["Article Titles"].substring(1,5)) {
            //         vm.blog.author = vm.authorData[j];
            //         vm.blog.author.name = vm.authorData[j].first_name + ' ' + vm.authorData[j].last_name;
            //         vm.blog.featured_image = vm.authorData[j].featured_image;
            //         break;
            //     }
            // }
        }

        function getDate() {
            return dateFns.format(vm.blog.date, 'MMMM Do YYYY, h:mm a');
        }

        function onChangeBloggerList(selectedAuthor){
            if (!selectedAuthor || selectedAuthor === '') return;
            $state.go('blogAuthor', { lastname: selectedAuthor.replace('.','') });
        }

        function getImageUrl() {
            var blogData = vm.blog;
            return blogData.featured_image;

            // var element = angular.element(blogData.content);
            // var id = element.find('img').attr('data-attachment-id');
            // return blogData.attachments[id] &&
            // blogData.attachments[id].thumbnails &&
            // blogData.attachments[id].thumbnails.thumbnail;
        }

        function setupMetaTags() {

            //title
            var title = 'guest blogger ' + utilities.getEndash() + ' ' + vm.blog.first_name + ' ' + vm.blog.last_name;
            
            //desc
            var idxAtEndOfSecondSentence = utilities.getNthIndex(vm.blog.bio,'.',2);
            var twoSentences = vm.blog.bio.substring(0,idxAtEndOfSecondSentence+1);
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
                twitterImageAlt: title,
            });
        }

        function addAuthorData() {
            //vm.authorData = dataFactory.temporaryAuthorData;
            dataFactory.getBlogAuthors().then(function(res) {
                vm.authorData = res.data.blogAuthors;

                //var parser = new DOMParser();
                for (var i=0;i<vm.blogs.length;i++) {
                    //vm.blogs[i].title = parser.parseFromString(vm.blogs[i].title,'text/html').body.textContent;
                    for (var j=0;j<vm.authorData.length;j++) {
                        vm.blogs[i].featured_image = '';
                        for (var k=0;k<vm.authorData[j]["Article Titles"].length;k++) {
                            if (vm.blogs[i].title.trim() === vm.authorData[j]["Article Titles"][k].trim()) {
                                vm.blogs[i].author = vm.authorData[j];
                                vm.blogs[i].author.name = vm.authorData[j].first_name + ' ' + vm.authorData[j].last_name;
                                vm.blogs[i].featured_image = vm.authorData[j].featured_image;
                                break;
                            }
                        }
                    }
                }
            });            
        }
    };

    blogAuthorController.$inject = ['$rootScope','$stateParams', 'dataFactory', 'blog','$state','utilities'];
    app.controller('blogAuthorController', blogAuthorController);
};
