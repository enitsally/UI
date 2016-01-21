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
      comment : '',
      files: []
    };

    $scope.file_log = [];

    $scope.file_descr = [];

    $scope.uploader = new FileUploader({
      url:'/upload$work$file',
      queueLimit: 20
    });

    $scope.uploader.onBeforeUploadItem = function(item) {
      item.formData.push({descr: $scope.file_descr[item.index-1]});
    };

    $scope.uploader.onSuccessItem  = function(item, response){
      var tmp  = {
        file_name: response.status.file_name,
        file_id : response.status.file_id,
        file_size : (parseFloat(item.file.size / 1024.00 / 1024.00).toFixed(2)) + 'MB',
        file_descr : item.formData[0].descr
      };
      $scope.file_log.push(tmp);
    }

    $scope.uploader.onCompleteAll = function (item, response, status, headers){
      var confirm = $mdDialog.confirm()
          .title('Would you like to confirm your upload')
          .ariaLabel('Confirm Dialog')
          .ok('Confirm')
          .cancel('Cancel');
      $mdDialog.show(confirm).then(function() {
        //Confirm Upload
        $scope.exp_files.files = [];
        for (var i = 0; i < $scope.file_log.length; i ++){
          $scope.exp_files.files.push($scope.file_log[i]);
        }

        $http.post('/confirm$work$file$upload', $scope.exp_files).then (function (response) {
          var msg = response.data.status;
          $scope.showSimpleToast(msg);

          $scope.doResetInput();

        }, function () {
        });

      }, function() {
        //Cancal Upload

        $http.post('/cancel$work$file$upload', $scope.file_log).then (function (response) {
          var msg = response.data.status;
          $scope.showSimpleToast(msg);

        }, function () {
        });
      });
    };

    $scope.clearAll = function(){
      $scope.uploader.clearQueue();
      $scope.file_descr = [];
      $scope.file_log = [];
    }

    $scope.doResetInput = function(){
      $scope.uploader.clearQueue();
      $scope.file_descr = [];
      $scope.file_log = [];

      $scope.exp_files.program = '';
      $scope.exp_files.record_mode = '';
      $scope.exp_files.read_only = '';
      $scope.exp_files.exp_type = '';
      $scope.exp_files.project = '';
      $scope.exp_files.tester = '';
      $scope.exp_files.comment = '';
      $scope.exp_files.files = [];

    }

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
