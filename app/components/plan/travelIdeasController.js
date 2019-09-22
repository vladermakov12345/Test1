module.exports = function(app) {
    var travelIdeasController = function ($rootScope,$scope,$state,dataFactory,$filter,$location, $window,environmentService,$q) {

        require("./travel-ideas.less");

        var vm = this;
        
        vm.env = environmentService();
        vm.blogs = [];
        vm.blogAuthors = [];

        vm.authorData = [];
        vm.breadcrumbs = [];

        //states
        vm.blogRetrievalState = 'fetching';

        vm.init = init;
        vm.getBlogs = getBlogs;
        vm.getBlogAuthors = getBlogAuthors;
        vm.crunch = crunch;

        vm.init();

        function init() {

            //set breadcrumbs
            vm.breadcrumbs = [
                { isActive: true, title: 'Travel Ideas' }
            ];

            //get blog data
            var cbs = [];
            cbs.push(vm.getBlogs());
            cbs.push(vm.getBlogAuthors());
            $q.all(cbs).then(function(x) {

                //problem during retrival?
                if (vm.blogs.length===0 || vm.blogAuthors.length===0) {
                    vm.blogRetrievalState = 'unavailable';
                }

                //associate data
                vm.crunch();

                //good to go
                vm.blogRetrievalState = 'ready';
            });
        }

        function getBlogs() {
            var deferred = $q.defer();
            dataFactory.getBlogs().then(function (res) {
                if (!res || !res.data || !res.data.posts) {
                    deferred.reject();
                    console.log('unable to retrieve blogs');
                    return;
                }
                vm.blogs = res.data.posts;
                deferred.resolve();
            });
            return deferred.promise;
        }

        function getBlogAuthors() {
            var deferred = $q.defer();
            dataFactory.getBlogAuthors().then(function(res) {
                if (!res || !res.data) {
                    deferred.reject();
                    console.log('unable to retrieve blog authors');
                    return;
                }
                vm.blogAuthors = res.data.blogAuthors;
                deferred.resolve();
            });
            return deferred.promise;
        }

        function crunch() {
            //var parser = new DOMParser();
            for (var i=0;i<vm.blogs.length;i++) {
                //vm.blogs[i].title = parser.parseFromString(vm.blogs[i].title,'text/html').body.textContent;
                for (var j=0;j<vm.blogAuthors.length;j++) {
                    vm.blogs[i].featured_image = '';
                    for (var k=0;k<vm.blogAuthors[j]["Article Titles"].length;k++) {
                        if (vm.blogs[i].title.trim() === vm.blogAuthors[j]["Article Titles"][k].trim()) {
                            vm.blogs[i].author = vm.blogAuthors[j];
                            vm.blogs[i].author.name = vm.blogAuthors[j].first_name + ' ' + vm.blogAuthors[j].last_name;
                            vm.blogs[i].featured_image = vm.blogAuthors[j].featured_image;
                            break;
                        }
                    }
                }
            }
        }

    };

    travelIdeasController.$inject = ['$rootScope','$scope','$state','dataFactory','$filter','$location', '$window','environmentService','$q'];
    app.controller('travelIdeasController', travelIdeasController);
};
