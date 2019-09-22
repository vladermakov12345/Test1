angular.module('app').directive('imgOrientation', function(){
    return {
        restrict: 'A',
        link: function(scope, element) {

            // SET CSS
            function setTransform(transform) {
                element.css('-ms-transform', transform);
                element.css('-webkit-transform', transform);
                element.css('-moz-transform', transform);
                element.css('transform', transform);
            }

            // CONVERT URL TO BASE64
            function toDataUrl(url, callback) {
                var xhr = new XMLHttpRequest();
                xhr.onload = function() {
                    var reader = new FileReader();
                    reader.onloadend = function() {
                        callback(reader.result);
                    }
                    reader.readAsDataURL(xhr.response);
                };
                xhr.open('GET', url);
                xhr.responseType = 'blob';
                xhr.send();
            }

            // ROTATE IMAGE
            var parent = element.parent();
            $(element).bind('load', function() {
                

                setTimeout(function () {
                    oneSec();
                }, 500);

            });

            function oneSec() {
                var compareto = document.getElementById("example2");
                EXIF.getData(compareto, function(data) {
                    var orientation;
                    var that = this;
                    toDataUrl(this.src, function(base64){
                        that.src = base64;
                        that.currentSrc = base64;

                        // GET ORIENTATION DETAILS
                        var allMetaData = EXIF.getAllTags(this);
                        exifOrientation = allMetaData.Orientation;
                        var height = element.height();
                        var width = element.width();

                        if (orientation && orientation !== 1) {
                            switch (orientation) {
                                case 2:
                                    setTransform('rotateY(180deg)');
                                    break;
                                case 3:
                                    setTransform('rotate(180deg)');
                                    break;
                                case 4:
                                    setTransform('rotateX(180deg)');
                                    break;
                                case 5:
                                    setTransform('rotateZ(90deg) rotateX(180deg)');
                                    if (width > height) {
                                        parent.css('height', width + 'px');
                                        element.css('margin-top', ((width -height) / 2) + 'px');
                                    }
                                    break;
                                case 6:
                                    setTransform('rotate(90deg)');
                                    if (width > height) {
                                        parent.css('height', width + 'px');
                                        element.css('margin-top', ((width -height) / 2) + 'px');
                                    }
                                    break;
                                case 7:
                                    setTransform('rotateZ(90deg) rotateY(180deg)');
                                    if (width > height) {
                                        parent.css('height', width + 'px');
                                        element.css('margin-top', ((width -height) / 2) + 'px');
                                    }
                                    break;
                                case 8:
                                    setTransform('rotate(-90deg)');
                                    if (width > height) {
                                        parent.css('height', width + 'px');
                                        element.css('margin-top', ((width -height) / 2) + 'px');
                                    }
                                    break;
                            }
                        }
                    })
                });
            }
        }
    };
});
