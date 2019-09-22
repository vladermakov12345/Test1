module.exports = function(app) {
    var blogController = function ($rootScope, dataFactory, $state, $stateParams) {

        var vm = this;

        vm.init = init;
        vm.blogs = [];
        vm.getDate = getDate;
        vm.getImageUrl = getImageUrl;
        //vm.getFilterBlogs = getFilterBlogs;
        vm.searchText = $stateParams.s;
        //vm.getBlogByBloggers = getBlogByBloggers;
        vm.isLookupInProcess = false;

        vm.addAuthorData = addAuthorData;
        vm.onChangeBloggerList=onChangeBloggerList;

       
        require("./blog.less");

        vm.init();

        function init() {

            //setup meta tags
            var title = 'Travel Blogs';
            var desc = 'Insight and inspiration from the accessible travel community.';
            $rootScope.metaTagService.setup({
                metaTitle: title,
                metaDescription: desc,
                ogType: 'article',
                ogTitle: title,
                ogDescription: desc,
                twitterTitle: title,
                twitterDescription: desc,
            });

            //do we have a search term?
            if (vm.searchText && vm.searchText!=='') {
                vm.isLookupInProcess = true;
                dataFactory.searchBlog(vm.searchText).then(function (blogs) {
                    //vm.filterBlogs(blogs);
                    vm.blogs = blogs;
                    vm.isLookupInProcess = false;
                });
                return;
            }

            dataFactory.getBlogs().then(function (res) {
               vm.blogs = res && res.data && res.data.posts;

               //hack until authors get on wordpress
               vm.addAuthorData();
            });
        }

        function onChangeBloggerList(selectedAuthor){
            if (!selectedAuthor || selectedAuthor === '') return;
            $state.go('blogAuthor', { lastname: selectedAuthor.replace('.','') });
        }


        function getDate(dateString) {
            return dateFns.format(dateString, 'MMMM Do YYYY, h:mm a');
        }

        function getImageUrl(blogData) {
            return blogData.featured_image;
            
            // var element = angular.element(blogData.content);
            // var id = element.find('img').attr('data-attachment-id');
            // return blogData.attachments[id] &&
            //         blogData.attachments[id].thumbnails &&
            //         blogData.attachments[id].thumbnails.thumbnail;
        }

        // function getFilterBlogs(blogs) {
        //     vm.blogs = blogs;
        // }

        // function getBlogByBloggers() {
        //     dataFactory.getBlogByBloggers().then(function (result) {
        //         vm.blogs = result.blogs;
        //         vm.user = result.user;
        //     });
        // }

        function addAuthorData() {
            //vm.authorData = dataFactory.temporaryAuthorData;
            dataFactory.getBlogAuthors().then(function(res) {
                vm.authorData = res.data.blogAuthors;

                //var parser = new DOMParser();
                for (var i=0;i<vm.blogs.length;i++) {
                    //vm.blogs[i].title = parser.parseFromString(vm.blogs[i].title,'text/html').body.textContent;
                    for (var j=0;j<vm.authorData.length;j++) {
                        vm.blogs[i].featured_image = '';
                        for (var k=0;k<vm.authorData.length;k++) {
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

    blogController.$inject = ['$rootScope', 'dataFactory', '$state', '$stateParams'];
    app.controller('blogController', blogController);
};
