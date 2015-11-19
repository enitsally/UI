'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('UploadOverviewCtrl', function ($scope, $http) {
    $scope.file = {
      read_only:'',
      upload_date:'',
      upload_user:'',
      doe_name:'',
      doe_descr: '',
      record_mode:'',
      program:'',
      file_size:''
    };

  $http.get('http://localhost:5000/get$upload$overview').then (function(response){
      $scope.uploadinfo = response.data.status;
  }, function(response){
  });

});
