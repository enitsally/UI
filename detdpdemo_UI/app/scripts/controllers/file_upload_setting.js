'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('fileUploadSettingCtrl', function ($scope, $http, $mdToast) {

    $scope.edit = true;
    $scope.hideform = true;
    $scope.currentSelection = {
      colName:'',
      row_id: ''
    };
    var originalLinkCols =[];
    var originaldPrefix = '';
    var originalcPrefix = '';

    $http.get('/get$link$cols$list$predix').then (function (response) {
      var tmp = response.data.status.linkCols;
      var pre = response.data.status.prefix;
      $scope.linkCols = tmp.slice(0);
      originalLinkCols = tmp.slice(0);
      $scope.dPrefix = pre['data_prefix'];
      $scope.cPrefix = pre['conf_prefix'];
      originaldPrefix = pre['data_prefix'];
      originalcPrefix = pre['conf_prefix'];

    }, function () {
    });

    $scope.editRow = function(flag, colName) {
      $scope.hideform = false;
      if (flag === 'N') {
        $scope.edit = true;
        }
      else {
        $scope.edit = false;
        $scope.currentSelection.colName = colName;
        $scope.currentSelection.row_id = flag;
      }
    };

    $scope.saveEdit = function (index){
      if (index > -1) {
        var tmp = $scope.currentSelection.colName;
        $scope.linkCols.splice(index, 1);
        $scope.linkCols.splice(index, 0 , tmp);
        //$scope.dataPair[index].program = $scope.currentSelection.program;
        //$scope.dataPair[index].record_mode = $scope.currentSelection.record_mode;
      }
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.colName = '';
    };

    $scope.saveNew = function () {
      var tmp = $scope.currentSelection.colName;
      $scope.linkCols.push(tmp);
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.colName = '';
    };

    $scope.doResetConf = function (){
      $scope.linkCols = originalLinkCols.slice(0);
      $scope.dPrefix = originaldPrefix;
      $scope.cPrefix = originalcPrefix;

      $scope.edit = true;
      $scope.hideform = true;
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.colName = '';
    };

    $scope.deleteRow = function (index){
      if (index > -1) {
          $scope.linkCols.splice(index, 1);
      }
    };

    $scope.doSaveAutoUploadConfToDB = function (){
      var currConf = {'data_prefix': $scope.dPrefix,
                  'conf_prefix': $scope.cPrefix,
                  'link_list' : $scope.linkCols

                };
      $http.post('/set$link$cols$list$predix', currConf).then (function (response) {
        var mgs = response.data.status;
        $http.get('/get$link$cols$list$predix').then (function (response) {
          var tmp = response.data.status.linkCols;
          var pre = response.data.status.prefix;
          $scope.linkCols = [];
          originalLinkCols = [];
          $scope.linkCols = response.data.status.linkCols;
          for (var i = 0; i < tmp.length; i++){
            originalLinkCols.push(tmp[i]);
          }
          $scope.dPrefix = pre['data_prefix'];
          $scope.cPrefix = pre['conf_prefix'];

        }, function () {
        });

        $scope.showSimpleToast(mgs);
      }, function () {
      });
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
    };

  });
