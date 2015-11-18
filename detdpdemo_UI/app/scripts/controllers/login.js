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
    $scope.user = {
      username:'',
      password:''
    };


    $scope.googleUrl = 'http://google.com';

    $scope.doLogin = function (){
      $http.post('http://localhost:5000/login', $scope.user).then(function(response){
        $scope.loginResult = response.data;

      },function(response){

      })
    }

  });
