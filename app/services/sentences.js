//"a" or "an"
module.exports = function(mod){
	var sentenceServiceFunc = function () {
	    this.pronoun = function (a) {
	        if (!a || a === "") return "";
	        var firstletter = a.charAt(0).toLowerCase();
	        var vowels = 'aeiou';
	        if (vowels.indexOf(firstletter) == -1)
	            return "a";
	        return "an";
	    };
	};
	sentenceServiceFunc.$inject = [];
    mod.service('myService', sentenceServiceFunc);
};