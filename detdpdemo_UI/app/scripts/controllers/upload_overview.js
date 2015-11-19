'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('UploadOverviewCtrl', function ($scope, $http, $mdDialog, items) {
    $scope.file = items;

    $http.get('http://localhost:5000/get$upload$overview').then (function (response) {
      $scope.uploadinfo = response.data.status;
    }, function (response) {
    });

    $scope.cancel = function () {
      $mdDialog.cancel();
    };
  });
