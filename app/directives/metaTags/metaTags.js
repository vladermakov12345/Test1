(function() {
    var metaTagsFunc = function (metaTagService, $window) {
        return {
            restrict: 'A',
            link: function(scope, element) {

                metaTagService.subscribe(addMetaTag, addLinkTag, addScriptTag);

                function addMetaTag(name, content) {
                    var tag = element[0].querySelector('meta[name="' + name + '"]');

                    if (tag) {
                        tag.setAttribute('content', content);
                        return;
                    }
                    
                    element.append('<meta name="' + name + '" content="' + content + '">');
                }

                function addLinkTag(content) {
                    var tag = element[0].querySelector('link[rel="canonical"]');

                    if (tag) {
                        tag.setAttribute('content', content);
                        return;
                    }
                    
                    element.append('<link rel="canonical" content="' + content + '">');
                }

                function addScriptTag(identifier, json) {

                    //prep json
                    var pj = JSON.stringify(json);

                    //get existing
                    var tag = element[0].querySelector('script[data-identifier="' + identifier + '"]');

                    //update existing
                    if (tag) {
                        tag.innerText = pj;
                        return;
                    }

                    //create new
                    var newTag = document.createElement('script');
                    newTag.setAttribute("type", "application/ld+json");
                    newTag.setAttribute("data-identifier", identifier);
                    angular.element(newTag).append(pj);

                    //add it
                    var logoScriptTag = element[0].querySelector('script[type="application/ld+json"]');
                    logoScriptTag.insertAdjacentElement('afterend', newTag);
                }
            }
        };
    };

    metaTagsFunc.$inject = ['metaTagService','$window'];
    angular.module('app').directive('mmMetaTags', metaTagsFunc);
})();