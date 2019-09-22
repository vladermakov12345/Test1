module.exports = function(app) {
  var cvvController = function($scope, $sce) {
    var vm = this;

    require("file-loader?name=creditcard.gif!../../../../resources/img/hotels/creditcard.gif");
  };

  cvvController.$inject = ['$scope','$sce'];
  app.controller('cvvController', cvvController);
};