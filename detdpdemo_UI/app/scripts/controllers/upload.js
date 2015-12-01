'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('UploadCtrl', function ($scope, $http, $state, $mdDialog, FileUploader) {
    $scope.file = {
      doe_name: '',
      doe_descr: '',
      doe_comment: '',
      doe_program: '',
      doe_record_mode: '',
      doe_read_only: '',
      upload_user: $scope.currentUser ? $scope.currentUser.id : '',
      flag: 1
    };

    $scope.pass = '';
    $scope.mgs = '';

    $scope.chkCols = {
      new_conf: '',
      dup_conf: '',
      conf_cols_ratio: '',
      new_conf_ratio: '',
      new_data: '',
      dup_data: '',
      data_cols_ratio: '',
      new_data_ratio: ''
    };

    $scope.uploader = new FileUploader({
      queueLimit: 2
    });

    $scope.doUploadChk = function(){

        console.log("Test starting");
        if ( angular.element("input[name='dFile']").val() == "" || angular.element("input[name='cFile']").val() == ""){
            $scope.pass = 'N';
            $scope.mgs = '<br> No files are selected for uploading!';
        }

        else if ($scope.file.doe_name == '' || $scope.file.prgram == '' || $scope.file.record_mode == '' || $scope.file.read_only == ''){
            $scope.pass = 'N';
            $scope.mgs = '<br> Required fields need to have values!';
        }
        else{
          $http.post('http://localhost:5000/get$exist$chk',$scope.file).then(function (r) {
              if (r.data.status.status == 'EXIST'){
                $scope.pass = 'N';
                $scope.mgs = r.data.status.comment;
              }
              else{
                $scope.pass = 'Y';
              }
              if ( $scope.pass== 'N' && $scope.file.flag == 1){
                var confirm = $mdDialog.confirm()
                  .title('Would you replace the existing files?')
                  .textContent('')
                  .ok('Please replace it!')
                  .cancel('NO, try it again after modification!');
                $mdDialog.show(confirm).then(function () {
                  $scope.file.flag = 2;
                  $scope.mgs = $scope.mgs + " <br> You confirmed to replace them."
                }, function(){

                });
                $scope.uploader.cancelAll();
              }
              else{
                $scope.mgs = $scope.mgs + " <br> You confirmed to replace them."
                $scope.uploader.uploadAll();
              }

          }),function(){
            }
        };

    };

    $scope.uploader.onSuccessItem = function (fileItem, response, status, headers) {
      var result = response.status;
      if (result['new_conf'] != undefined) {
        $scope.chkCols.new_conf = result['new_conf']
      }

      if (result['dup_conf'] != undefined) {
        $scope.chkCols.dup_conf = result['dup_conf']
      }

      if (result['conf_cols_ratio'] != undefined) {
        $scope.chkCols.conf_cols_ratio = result['conf_cols_ratio']
      }
      if (result['new_conf_ratio'] != undefined) {
        $scope.chkCols.new_conf_ratio = result['new_conf_ratio']
      }
      if (result['new_data'] != undefined) {
        $scope.chkCols.new_data = result['new_data']
      }
      if (result['dup_data'] != undefined) {
        $scope.chkCols.dup_data = result['dup_data']
      }
      if (result['data_cols_ratio'] != undefined) {
        $scope.chkCols.data_cols_ratio = result['data_cols_ratio']
      }
      if (result['new_data_ratio'] != undefined) {
        $scope.chkCols.new_data_ratio = result['new_data_ratio']
      }

      if (fileItem.alias == 'conf') {
        $scope.file.conf_file = result['temp_file_id'];
      }

      if (fileItem.alias == 'data') {
        $scope.file.data_file = result['temp_file_id'];
      }
    };
    console.log($scope.file)
    $scope.uploader.onCompleteAll = function () {
      $mdDialog.show({
        templateUrl: 'views/upload_col_chk.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: {
          result: $scope.chkCols,
          arg: $scope.file
        },
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, result, arg) {
        console.log(arg)
        $scope.items = result;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        };
        $scope.doUpload = function () {
          $http.post('http://localhost:5000/get$upload', arg).then (function (resp) {
            var result = resp.data.status;
            console.log(resp);
            console.log(result);
          }, function (response) {
          });
        };
        $scope.doDelTemp = function () {
          $http.post('http://localhost:5000/get$del$temp', arg).then (function (response) {
            $scope.doneDel = { 'data_status':response.data.status.data_status,
                               'conf_status':response.data.status.conf_status};
            console.log("delete temp" + $scope.doneDel);
            doClearAll();
            $mdDialog.hide();
          }, function (response) {
          });
        };
      };

      $scope.uploader.clearQueue();
    };

    $http.get('http://localhost:5000/get$record$mode').then (function (response) {
      $scope.recordmode_list = response.data.status;
    }, function (response) {
    });

    $http.get('http://localhost:5000/get$program').then (function (response) {
      $scope.program_list = response.data.status;
    }, function (response) {
    });

    $scope.doOverview = function () {
      $http.get('http://localhost:5000/get$overview').then(function (response) {
        var loginResult = response.data.status;
      }, function (response) {
      });
    };

    $scope.doClearAll = function () {
      $scope.uploader.clearQueue();
      $scope.file = {
        doe_name: '',
        doe_descr: '',
        doe_comment: '',
        doe_program: '',
        doe_record_mode: '',
        doe_read_only: '',
        flag : 1
      };
      $scope.pass = '';
      $scope.mgs = '';
      angular.element("input[type='file']").val(null);
    };

    $scope.doUplSearch = function (ev) {
      $mdDialog.show({
          templateUrl: 'views/upload_overview.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          controller: 'UploadOverviewCtrl',
          locals: {items: $scope.file}
        })
        .then(function () {
        }, function () {
        });
    };
    $scope.showAdvanced = function (ev) {
      $mdDialog.show({
          templateUrl: 'views/upload_overview.html',
          parent: angular.element(document.body),
          targetEvent: ev,
          clickOutsideToClose: true,
          controller: 'UploadOverviewCtrl',
          locals: {items: $scope.file}
        })
        .then(function () {
        }, function () {
        });
    };
  });
