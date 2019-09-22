module.exports = function(mod){
	var imageService = function(environmentService) {
		var vm = this;
		vm.env = environmentService();

	    this.getPathToImage = function (asset) {
			if (!asset || !asset.Id) return "";
			console.log(vm.env.BASEURL_CONTENT);
	        return vm.env.BASEURL_CONTENT + '/Image/GetImage?assetId=' + asset.Id + '&size.Name=medium';           
	    };
	};

    imageService.$inject = ['environmentService'];
    mod.service('imageService', imageService);
};
