'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the detdpdemoApp
 */
// angular.module('detdpdemoApp')
//   .controller('MainCtrl', function () {
//     this.awesomeThings = [
//       'HTML5 Boilerplate',
//       'AngularJS',
//       'Karma'
//     ];
//   });

angular.module('detdpdemoApp')
.controller('LoginCtrl', function($scope) {
  $scope.title1 = 'Button';
  $scope.title4 = 'Warn';
  $scope.isDisabled = true;

  $scope.googleUrl = 'http://google.com';

});
