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
  .controller('LoginCtrl', function ($scope, $http) {
    $scope.title1 = 'Button';
    $scope.title4 = 'Warn';
    $scope.isDisabled = true;

    $scope.googleUrl = 'http://google.com';

    $http.get('http://localhost:5000/list').then(function (response) {
      $scope.data = response.data;
    }, function (response) {
    })

    $scope.doLogin = function (){
      $http.post('http://localhost:5000/login', $scope.user).then(function(response){
        $scope.loginResult = response.data;

      },function(response){

      })
    }

  });
