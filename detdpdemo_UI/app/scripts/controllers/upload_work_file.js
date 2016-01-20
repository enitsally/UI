'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('UploadWorkFileCtrl', function ($scope, $http, $state, $mdDialog, $mdToast, FileUploader) {

    $scope.exp_files = {
      exp_user : $scope.currentUser ? $scope.currentUser.id : '',
      program : '',
      record_mode : '',
      read_only : '',
      exp_type : '',
      project : '',
      tester : '',
      comment : ''
    };

    $scope.file_descr = '';

    $scope.uploader = new FileUploader({
      url:'/upload$work$file',
      queueLimit: 20
    });

    $scope.uploader.onBeforeUploadItem = function(item) {
      console.log($scope.file_descr);
      item.formData.push({item_descr: $scope.file_descr, item_index: item.index});
    };

    $scope.uploader.onCompleteAll = function (item, response, status, headers){
      // console.log(item);
      // console.log(response);
      // console.log(status);
      // console.log(headers);

    };


    $http.get('/get$record$mode').then (function (response) {
      $scope.recordmode_list = response.data.status;
    }, function () {
    });

    $http.get('/get$program').then (function (response) {
      $scope.program_list = response.data.status;
    }, function () {
    });

    $http.get('/get$exp$type').then (function (response) {
      $scope.exp_type = response.data.status;
    }, function () {
    });

    $scope.doResetInput = function(){
      $scope.exp_files.program = '';
      $scope.exp_files.record_mode = '';
      $scope.exp_files.read_only = '';
      $scope.exp_files.exp_type = '';
      $scope.exp_files.project = '';
      $scope.exp_files.tester = '';
      $scope.exp_files.comment = '';
      angular.element("input[type='file']").val(null);

    }

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
    };


  });
