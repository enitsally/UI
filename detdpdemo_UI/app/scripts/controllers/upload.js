'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('UploadCtrl', function ($scope, $http, $state, $mdDialog, $mdToast, FileUploader) {
    // if ($scope.currentUser == null){
    //   $state.go('login')
    // }

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
        if ( angular.element("input[name='dFile']").val() === "" || angular.element("input[name='cFile']").val() === ""){
            $scope.pass = 'N';
            $scope.mgs = ' No files are selected for uploading!';
            return;
        }

        if ($scope.file.doe_name === '' || $scope.file.doe_prgram === '' || $scope.file.doe_record_mode === '' || $scope.file.doe_read_only === ''){
            $scope.pass = 'N';
            $scope.mgs = ' Required fields need to have values!';
            return;
        }

        $http.post('http://localhost:5000/get$exist$chk',$scope.file).then(function (r) {
            if (r.data.status.status === 'EXIST'){
              $scope.pass = 'N';
              $scope.mgs = '\n' + r.data.status.comment;
            }
            else{
              $scope.pass = 'Y';
            }
            if ( $scope.pass=== 'N' && $scope.file.flag === 1){
              var confirm = $mdDialog.confirm()
                .title('Would you replace the existing files?')
                .ok('Please replace it!')
                .cancel('NO, try it again after modification!');
              $mdDialog.show(confirm).then(function () {
                $scope.file.flag = 2;
                $scope.mgs = $scope.mgs + " You confirmed to replace them.";
              }, function(){

              });
              $scope.uploader.cancelAll();
            }
            else{
              $scope.mgs = $scope.mgs + " You confirmed to replace them.";
              $scope.uploader.uploadAll();
            }

        },function(){
        });
    };

    $scope.uploader.onSuccessItem = function (fileItem, response) {
      var result = {};
      result = response.status;
      if (result['new_conf'] !== undefined) {
        $scope.chkCols.new_conf = result['new_conf'];
      }

      if (result['dup_conf'] !== undefined) {
        $scope.chkCols.dup_conf = result['dup_conf'];
      }

      if (result['conf_cols_ratio'] !== undefined) {
        $scope.chkCols.conf_cols_ratio = result['conf_cols_ratio'];
      }
      if (result['new_conf_ratio'] !== undefined) {
        $scope.chkCols.new_conf_ratio = result['new_conf_ratio'];
      }
      if (result['new_data'] !== undefined) {
        $scope.chkCols.new_data = result['new_data'];
      }
      if (result['dup_data'] !== undefined) {
        $scope.chkCols.dup_data = result['dup_data'];
      }
      if (result['data_cols_ratio'] !== undefined) {
        $scope.chkCols.data_cols_ratio = result['data_cols_ratio'];
      }
      if (result['new_data_ratio'] !== undefined) {
        $scope.chkCols.new_data_ratio = result['new_data_ratio'];
      }

      if (fileItem.alias === 'conf') {
        $scope.file.conf_file = result['temp_file_id'];
      }

      if (fileItem.alias === 'data') {
        $scope.file.data_file = result['temp_file_id'];
      }
    };

    $scope.uploader.onCompleteAll = function () {
      $mdDialog.show({
        templateUrl: 'views/upload_col_chk.html',
        parent: angular.element(document.body),
        clickOutsideToClose: true,
        locals: {
          result: $scope.chkCols,
          arg: $scope.file
        },
        scope: $scope,        // use parent scope in template
        preserveScope: true,
        controller: DialogController
      });

      function DialogController($scope, $mdDialog, result, arg) {
        $scope.items = result;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        };
        $scope.doUpload = function () {
          $http.post('http://localhost:5000/get$upload', arg).then (function (resp) {
            var result = resp.data.status;
            $mdDialog.hide();
            $scope.doClearAll();
            console.log(result);
            if (result.status === 'INSERT'){
              $scope.showSimpleToast("INSERT DONE!");
            }
            else {
              $scope.showSimpleToast("INSERT FAILED!");
            }

          }, function () {
            });
        };
        $scope.doDelTemp = function () {
          $http.post('http://localhost:5000/get$del$temp', arg).then (function (response) {
            var doneDel = { 'data_status':response.data.status.data_status ? "Deleted":'Wrong',
                               'conf_status':response.data.status.conf_status ? "Deleted":'Wrong'};
            $mdDialog.hide();
            $scope.doClearAll();
            console.log(doneDel);
            if ( response.data.status.data_status && response.data.status.conf_status){
              $scope.showSimpleToast("TEMP DELETE DONE!");
            }
            else{
              $scope.showSimpleToast("TEMP DELETE FAILED!");
            }

          }, function () {
          });
        };

        $scope.showSimpleToastMgs = function(showmgs) {
          $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
        };
      }

      $scope.uploader.clearQueue();
    };

    $http.get('http://localhost:5000/get$record$mode').then (function (response) {
      $scope.recordmode_list = response.data.status;
    }, function () {
    });

    $http.get('http://localhost:5000/get$program').then (function (response) {
      $scope.program_list = response.data.status;
    }, function () {
    });


    $scope.doClearAll = function() {
      $scope.uploader.clearQueue();
      $scope.file.doe_name = '';

      $scope.file.doe_descr = '';
      $scope.file.doe_comment = '';
      $scope.file.doe_program = '';
      $scope.file.doe_record_mode = '';
      $scope.file.doe_read_only = '';
      $scope.file.flag = 1;
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
          controller: UploadOverviewSearchCtrl,
          locals: {uploadinfo: $scope.uploadinfo}
        });
        function UploadOverviewSearchCtrl($scope, $mdDialog, uploadinfo) {
          $scope.uploadinfo = uploadinfo;
          $scope.closeDialog = function () {
            $mdDialog.hide();
          };
        }
    };
    $scope.doOverview = function (ev) {
      $http.get('http://localhost:5000/get$upload$overview').then (function (response) {
        $scope.uploadinfo = response.data.status;

        $mdDialog.show({
            templateUrl: 'views/upload_overview.html',
            parent: angular.element(document.body),
            targetEvent: ev,
            clickOutsideToClose: true,
            controller: UploadOverviewCtrl,
            locals: {uploadinfo: $scope.uploadinfo}
          });
          function UploadOverviewCtrl($scope, $mdDialog, uploadinfo) {
            $scope.uploadinfo = uploadinfo;
            $scope.closeDialog = function () {
              $mdDialog.hide();
            };
          }

      }, function () {
      });
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
    };

  });
