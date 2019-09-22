module.exports = function(mod){
    var metaTagService = function (utilities,$location,$window,environmentService) {

    	var vm = this;
    	vm.env = environmentService();

    	//var _tags = [];
        var _subscriber;
        var _linkTagFunc;
        var _scriptTagFunc;

    	var metaTitle;
    	var metaDescription = '';
    	var metaKeywords = '';

    	//open graph
    	var ogUrl = '';
    	var ogType = '';
    	var ogTitle = '';
		var ogDescription = '';
		var ogImage = '';

		//twitter
		var twitterCard = '';
		var twitterSite = '';
		var twitterCreator = '';
		var twitterTitle = '';
		var twitterDescription = '';
		var twitterImage = '';
		var twitterImageAlt = '';

		//google search
		var breadcrumbJson = [];
		var articleJson;

		//SEO
		var googleBotIndex = 'all';

		//private
		vm._addMetaTag = _addMetaTag;
		vm._addLinkTag = _addLinkTag;
		vm._addJSONLPBreadcrumbTag = _addJSONLPBreadcrumbTag;
		vm._addJSONLPTag = _addJSONLPTag;
		vm._apply = _apply;

		//tags
		vm.GetMetaTitle = GetMetaTitle;
		vm.GetMetaDescription = GetMetaDescription;
		vm.GetMetaKeywords = GetMetaKeywords;
		vm.GetGoogleBotIndex = GetGoogleBotIndex;
		vm.GetLinkCanonical = GetLinkCanonical;
		vm.GetOgUrl = GetOgUrl;
		vm.GetOgType = GetOgType;
		vm.GetOgTitle = GetOgTitle;
		vm.GetOgDescription = GetOgDescription;
		vm.GetOgImage = GetOgImage;
		vm.GetTwitterCard = GetTwitterCard;
		vm.GetTwitterSite = GetTwitterSite;
		vm.GetTwitterCreator = GetTwitterCreator;
		vm.GetTwitterTitle = GetTwitterTitle;
		vm.GetTwitterDescription = GetTwitterDescription;
		vm.GetTwitterImage = GetTwitterImage;
		vm.GetTwitterImageAlt = GetTwitterImageAlt;

		//google tags
		vm.GetBreadcrumbJson = GetBreadcrumbJson;
		vm.GetArticleJson = GetArticleJson;

		//facebook
		//todo: remove this after prooving it works via maincontroller
		//var facebookPixelScript = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '312392209172643'); fbq('track', 'PageView');";
		//todo: add this to maincontroller
		//var facebookPixelNoScript = "<img height='1' width='1' style='display:none' src='https:\/\/www.facebook.com/tr?id=312392209172643&ev=PageView&noscript=1'\/>";

		function _addMetaTag(name, content) {
			//this._tags.push({ name: name, content: content });
    		_subscriber(name, content);    
		}

		function _addLinkTag(content) {
			_linkTagFunc(content);
		}

		function _addJSONLPBreadcrumbTag() {

            var json =     {
				"@context": "http://schema.org",
				"@type": "BreadcrumbList",
				"itemListElement":
				[
				  {
				   type: 'ListItem',
				   position: 1,
				   name: 'accessible Travel',
				   item: 'https://accessibleGO.com/home'
				  }
				]
			};

			var bcJson = GetBreadcrumbJson();
			if (bcJson && bcJson.length>0) {
				json.itemListElement = json.itemListElement.concat(bcJson);
			}

			_scriptTagFunc('BreadcrumbList', json);
		}

		function _addJSONLPTag(identifier, json) {
			if (!json || json==='') return;
			_scriptTagFunc(identifier, json);
		}
		
		function _apply() {
			$window.document.title = GetMetaTitle();
            _addMetaTag('title', GetMetaTitle());
            _addMetaTag('description', GetMetaDescription());
            _addMetaTag('keywords', GetMetaKeywords());

           	_addMetaTag('googlebot',GetGoogleBotIndex());

			_addMetaTag('fb:app_id', vm.env.fb_app_id);
            _addMetaTag('og:site_name', 'accessibleGO.com');
            _addMetaTag('og:locale', 'en_US');
            _addMetaTag('og:url', GetOgUrl());
            _addMetaTag('og:type', GetOgType());
            _addMetaTag('og:title', GetOgTitle());
            _addMetaTag('og:description', GetOgDescription());
            _addMetaTag('og:image', GetOgImage());
            _addMetaTag('twitter:card', GetTwitterCard());
            _addMetaTag('twitter:site', GetTwitterSite());
            _addMetaTag('twitter:creator', GetTwitterCreator());
            _addMetaTag('twitter:title', GetTwitterTitle());
            _addMetaTag('twitter:description', GetTwitterDescription());
            _addMetaTag('twitter:image', GetTwitterImage());
            _addMetaTag('twitter:image:alt', GetTwitterImageAlt());
            _addMetaTag('google-site-verification', 'MSQax1J7wJsvyBL8kYl8OUVsnfCwUvOLXY7torTfzFI');	//google search console
            _addLinkTag(GetLinkCanonical());
            _addJSONLPBreadcrumbTag();
            _addJSONLPTag('NewsArticle', GetArticleJson());

		}

		function GetMetaTitle() {
			return metaTitle ? metaTitle + ' ' + utilities.getEndash() + ' accessibleGO' : 'accessible travel for everyone';
		}

		function GetMetaDescription(keepHTML) {
			if (!metaDescription) return GetDefaultMetaDescription();
			if (keepHTML) return metaDescription;
			return utilities.removeHTML(metaDescription);
		}

		function GetMetaKeywords() {
			return metaKeywords?metaKeywords:GetDefaultMetaKeywords();
		}

		function GetGoogleBotIndex() {
			if (!googleBotIndex || googleBotIndex === '') return 'all';
			return googleBotIndex;
		}

		function GetLinkCanonical() {
			return GetCanonical();
		}

		function GetOgUrl() {
			return GetCanonical();
		}

		function GetOgType() {
			return ogType?ogType:'website';
		}

		function GetOgTitle() {
			return ogTitle?ogTitle:'accessibleGO';
		}

		function GetOgDescription(keepHTML)
		{
			if (!ogDescription) return GetDefaultMetaDescription();
			if (keepHTML) return ogDescription;
			return utilities.removeHTML(ogDescription);
		}

		function GetOgImage() {
			return ogImage?ogImage:GetDefaultImage();
		}

		function GetTwitterCard() {
			return twitterCard?twitterCard:'summary_large_image';
		}

		function GetTwitterSite() {
			return twitterSite?twitterSite:'@accessibleGO';
		}

		function GetTwitterCreator() {
			return twitterCreator?twitterCreator:'@accessibleGO';	//change to @accessiblego ???;
		}

		function GetTwitterTitle() {
			return twitterTitle?twitterTitle:'accessibleGO';
		}

		function GetTwitterDescription(keepHTML) {
			if (!twitterDescription) return GetDefaultMetaDescription();
			if (keepHTML) return twitterDescription;
			return utilities.removeHTML(twitterDescription);
		}

		function GetTwitterImage() {
			return twitterImage?twitterImage:GetDefaultImage();
		}

		function GetTwitterImageAlt() {
			return twitterImageAlt?twitterImageAlt:'accessibleGO';
		}

		function GetBreadcrumbJson() {
			return breadcrumbJson;
		}

		function GetArticleJson() {
			return articleJson;
		}

		//facebook
		// facebookPixelScript: function() {
		// 	if (vm.env.name === 'production') {
		// 		return facebookPixelScript;
		// 	}
		// 	return '';
		// },
		// facebookPixelNoScript: function() {
		// 	if (vm.env.name === 'production') {
		// 		return facebookPixelNoScript;
		// 	}
		// 	return '';
		// }

		function GetCanonical() {
            if (vm.env.name === 'production') {
				//would $location.absUrl() suffice for url or path in all cases?
				var c = 'https://accessiblego.com' + $location.url();
				console.log('testing canonical --> ' + c);
                return c;
            } 
            return $location.absUrl();
        }

		function GetDefaultMetaDescription() {
        	return 'accessibleGO.com is a full-service accessible travel platform providing search, reviews, and booking of accessible hotels and destinations worldwide.';
        }

        function GetDefaultMetaKeywords() {
        	return 'accessible travel, wheelchair accessible, accessible rooms';
        }

        function GetDefaultImage() {
        	//var imgPath = '/web/public/resources/transparent_square_250_200.png';
        	//if (vm.env.name === 'production') {
                //return 'https://accessiblego.com' + imgPath;
            //} 
            //return $location.protocol()+'://'+$location.host()+':'+$location.port() + imgPath;
            return vm.env.cdn_static+'/i/logo/transparent_square_250_200.png';
        }

		return {
			subscribe: function(addMetaTagCB,addLinkTagCB,addScriptTagCB) {
		        if (!_subscriber) {
		            _subscriber = addMetaTagCB;
		            _linkTagFunc = addLinkTagCB;
		            _scriptTagFunc = addScriptTagCB;
		        } else {
		            throw new Error('Subscriber already attached. Only one subscriber may be added as there can only be one instance of <head>');
		        }
    		},
			addMetaTag: function(name, content) {
				_addMetaTag(name, content);
				_apply();
			},
			setup: function(config) {
				metaTitle = config.metaTitle;
				metaDescription = config.metaDescription;
				metaKeywords = config.metaKeywords;

				ogType = config.ogType;
				ogTitle = config.ogTitle;
				ogDescription = config.ogDescription;
				ogImage = config.ogImage;

				twitterCard = config.twitterCard;
				twitterSite = config.twitterSite;
				twitterCreator = config.twitterCreator;
				twitterTitle = config.twitterTitle;
				twitterDescription = config.twitterDescription;
				twitterImage = config.twitterImage;
				twitterImageAlt = config.twitterImageAlt;

				breadcrumbJson = config.breadcrumbJson;
				articleJson = config.articleJson;

				googleBotIndex = config.googleBotIndex;

				_apply();
			},
		};
    };

    metaTagService.$inject = ['utilities','$location','$window','environmentService'];
    mod.service('metaTagService', metaTagService);
};

/* implementing this from mainController
        $rootScope.setMetaDescription = function(description) {
            if (!description || description==='') return;
            $rootScope.description = description;
        };
        $rootScope.setMetaTitle = function(title) {
            if (!title || title==='') return;
            $rootScope.title = 'accessibleGO.com : ' + title;
        };
        $rootScope.setMetaKeywords = function(keywords) {
            if (!keywords || keywords==='') return;
            $rootScope.keywords = keywords;
        };
        $rootScope.setCanonical = function(path) {
            var root = '';
            if (vm.env.name === 'production') {
                root = 'https://accessiblego.com';
            } 
            if (vm.env.name === 'development') {
                 root = $location.absUrl();
            }
            if (!path || path==='') return root;
            $rootScope.canonical = root + path;
        };
*/
