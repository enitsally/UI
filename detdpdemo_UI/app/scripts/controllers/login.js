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
  .controller('LoginCtrl', function ($scope, $http,$state) {
    $scope.user = {
      username:'',
      password:''
    };


    $scope.googleUrl = 'http://google.com';

    $scope.doLogin = function (){

      $http.post('http://localhost:5000/login', $scope.user).then(function(response){
        var loginResult = response.data.status;
        if (loginResult == 'R')
        {
          $state.go('retrieve');
        }

        else if (loginResult  == 'U')
        {
          $state.go('upload');
        }
        else
        {
          $scope.message = "Login failed, please try again."
        }
      },function(response){
      })
    }
  });
