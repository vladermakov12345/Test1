// src can have a value - micro image/loader gif
// literal string e.g. 'https://placehold.it/500x500'
// <img lazy-load="'literal source'" class="lazy-load" src="" alt=""/>
// expression()
// <img lazy-load="expression()" class="lazy-load" src="" alt=""/>
// $scope object e.g. $scope.url = 'https://placehold.it/500x500';
// <img lazy-load="url" class="lazy-load" src="" alt=""/>

module.exports = function(app){
    var lazyLoadImageFunc = function ($parse) {
        'use strict';
        return {
            restrict: 'A',
            link: function link(scope, element, attrs) {
                var observer = new IntersectionObserver(loadImg);
                var img = angular.element(element)[0];

                observer.observe(img);
                function loadImg(changes) { 
                    changes.forEach(function (change) {
                        if (change.intersectionRatio > 0) {
                            observer.unobserve(change.target);
                            
                            change.target.src = $parse(attrs.lazyLoad)(scope);

                            change.target.classList.add('lazy-image--handled');
                            change.target.classList.remove('lazy-load');
                            change.target.parentElement.classList.add('lazy-image--handled');
                            change.target.parentElement.classList.remove('lazy-load');
                        }
                    });
                }
            }
        };
    };

    lazyLoadImageFunc.$inject = ['$parse'];
    app.directive('lazyLoad', lazyLoadImageFunc);
};