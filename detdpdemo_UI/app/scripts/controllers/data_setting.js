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
    $scope.edit = true;
    $scope.hideform = true;
    $scope.currentSelection = {
      'row_id':'',
      'program':'',
      'record_mode':''
    };
    var originalDataPair =[];

    $http.get('http://localhost:5000/get$program$recordmode$pair').then (function (response) {
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
      $scope.dataPair = originalDataPair.slice(0);

      $scope.edit = true;
      $scope.hideform = true;
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.program = '';
      $scope.currentSelection.record_mode = '';
    };

    $scope.deleteRow = function (index){
      if (index > -1) {
          $scope.dataPair.splice(index, 1);
      }
    };

    $scope.doSaveDataToDB = function (){
      $http.post('http://localhost:5000/set$program$recordmode$pair', $scope.dataPair).then (function (response) {
        var msg = response.data.status;

        $http.get('http://localhost:5000/get$program$recordmode$pair').then (function (response) {
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
      }, function () {
      });
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
    };


  });
