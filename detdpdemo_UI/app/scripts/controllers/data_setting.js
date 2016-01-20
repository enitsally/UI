'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('dataSettingCtrl', function ($scope, $http, $mdToast) {
    $scope.selectedIndex = 0;
    $scope.edit = true;
    $scope.hideform = true;
    $scope.currentSelection = {
      'row_id':'',
      'program':'',
      'record_mode':''
    };

    $scope.typeEdit = true;
    $scope.typeHideform = true;
    $scope.currentType = {
      type: '',
      row_id:''
    };

    var originalDataPair =[];
    var originalExpType = [];

    $scope.setIndex = function (index){
      $scope.selectedIndex = index;
    }

    $http.get('/get$program$recordmode$pair').then (function (response) {
      var tmp = response.data.status;
      $scope.dataPair = tmp.slice(0);
      originalDataPair = tmp.slice(0);

    }, function () {
    });

    $scope.editRow = function(id, program, record_mode) {
      $scope.hideform = false;
      if (id === 'new') {
        $scope.edit = true;
        }
      else {
        $scope.edit = false;
        $scope.currentSelection.row_id = id;
        $scope.currentSelection.program = program;
        $scope.currentSelection.record_mode = record_mode;

      }
    };

    $scope.saveEdit = function (index){
      if (index > -1) {
        var tmp = {
          'program':$scope.currentSelection.program,
          'record_mode':$scope.currentSelection.record_mode
        };
        $scope.dataPair.splice(index, 1);
        $scope.dataPair.splice(index, 0 , tmp);
        //$scope.dataPair[index].program = $scope.currentSelection.program;
        //$scope.dataPair[index].record_mode = $scope.currentSelection.record_mode;
      }
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.program = '';
      $scope.currentSelection.record_mode = '';
      console.log (originalDataPair.length);
    };

    $scope.saveNew = function () {
      var tmp = {
        'row_id':$scope.currentSelection.row_id,
        'program':$scope.currentSelection.program,
        'record_mode':$scope.currentSelection.record_mode
      };
      $scope.dataPair.push(tmp);
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.program = '';
      $scope.currentSelection.record_mode = '';
    };

    $scope.doResetData = function (){
      if ($scope.selectedIndex === 0) {
        $scope.dataPair = originalDataPair.slice(0);

        $scope.edit = true;
        $scope.hideform = true;
        $scope.currentSelection.row_id = '';
        $scope.currentSelection.program = '';
        $scope.currentSelection.record_mode = '';
      }
      else if ($scope.selectedIndex === 1) {

        $scope.expType = originalExpType.slice(0);

        $scope.typeEdit = true;
        $scope.typeHideform = true;
        $scope.currentType.row_id = '';
        $scope.currentType.type = '';
      }
    };

    $scope.deleteRow = function (index){
      if (index > -1) {
          $scope.dataPair.splice(index, 1);
      }
    };

    $scope.doSaveDataToDB = function (){
      var msg = "";
      if ($scope.selectedIndex === 0){
        $http.post('/set$program$recordmode$pair', $scope.dataPair).then (function (response) {
          msg = response.data.status;
          $http.get('/get$program$recordmode$pair').then (function (response) {
            var tmp = response.data.status;
            $scope.dataPair = [];
            originalDataPair = [];
            $scope.dataPair = response.data.status;
            for (var i = 0; i < tmp.length; i++){
              originalDataPair.push(tmp[i]);
            }
          }, function () {
          });

          $scope.showSimpleToast(msg);
        },function(){
        });
      }
      else if ($scope.selectedIndex === 1){
          $http.post('/set$exp$type', $scope.expType).then (function (response) {
            msg = response.data.status;
            $http.get('/get$exp$type').then (function (response) {
              var tmp = response.data.status;
              $scope.expType = [];
              originalExpType = [];
              $scope.expType = response.data.status;
              for (var i = 0; i < tmp.length; i++){
                originalExpType.push(tmp[i]);
              }
            }, function () {
          });

          $scope.showSimpleToast(msg);
        },function(){
        });
      }

    };


    // Start here for exp type setting

    $http.get('/get$exp$type').then (function (response) {
      var tmp = response.data.status;
      $scope.expType = tmp.slice(0);
      originalExpType = tmp.slice(0);

    }, function () {
    });

    $scope.editType = function(flag, type) {
      $scope.typeHideform = false;
      if (flag === 'N') {
        $scope.typeEdit = true;
        }
      else {
        $scope.typeEdit = false;
        $scope.currentType.type = type;
        $scope.currentType.row_id = flag;
      }
    };

    $scope.saveEditType = function (index){
      if (index > -1) {
        var tmp = $scope.currentType.type;
        $scope.expType.splice(index, 1);
        $scope.expType.splice(index, 0 , tmp);
      }
      $scope.currentType.row_id = '';
      $scope.currentType.type = '';
    };

    $scope.saveNewType = function () {
      var tmp = $scope.currentType.type;
      $scope.expType.push(tmp);
      $scope.currentType.row_id = '';
      $scope.currentType.type = '';
    };


    $scope.deleteType = function (index){
      if (index > -1) {
          $scope.expType.splice(index, 1);
      }
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
    };


  });
