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
        $scope.items = result;
        $scope.closeDialog = function () {
          $mdDialog.hide();
        };
        $scope.doUpload = function () {
          $http.post('http://localhost:5000/get$upload', arg).then (function (resp) {
            var result = resp.data.status;
            console.log(resp)
            console.log(result)
            if (result.status == 'EXIST') {
              var confirm = $mdDialog.confirm()
                .title('Would you replace the existing files?')
                .textContent('')
                .ok('Please replace it!')
                .cancel('NO, try it again after modification!');
              $mdDialog.show(confirm).then(function () {
                arg.flag = 2;
                console.log(arg);
                $http.post('http://localhost:5000/get$upload', arg).then (function (respp) {
                  console.log(respp);
                  $mdDialog.show(
                    $mdDialog.alert()
                      .parent(angular.element(document.querySelector('#popupContainer')))
                      .clickOutsideToClose(true)
                      .title('This is an confirm message')
                      .textContent(resp.data.comment)
                      .ok('Got it!')
                  );
                }, function () {

                });
              }, function () {
                arg.flag = 1;
                $state.go('upload')
              });
            }
            else {

            }
          }, function (response) {
          });
        }
        $scope.doDelTemp = function () {
          $http.post('http://localhost:5000/get$del$temp', arg).then (function (response) {
            $scope.doneDel = response.data.status;
          }, function (response) {
          });
        }
      }

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
        doe_read_only: ''
      };

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
