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
      sub_exp_no : 0,
      comment : ''
    };

    var uploader = $scope.uploader = new FileUploader({
      queueLimit: 20
    });

    // FILTERS

    uploader.filters.push({
        name: 'customFilter',
        fn: function(item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 20;
        }
    });

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function(item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function(fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function(addedFileItems) {
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function(item) {
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function(fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function(progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function(fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function(fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function(fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function(fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function() {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

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


    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
    };


  });
