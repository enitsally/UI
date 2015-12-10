'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('colMappingCtrl', function ($scope, $http, $mdToast) {
    $scope.edit = true;
    $scope.hideform = true;
    $scope.currentSelection = {
      oldCol:'',
      newCol:'',
      row_id: ''
    };
    var originalMappingPair =[];

    $http.get('http://localhost:5000/get$colmn$mapping$pair').then (function (response) {
      var tmp = response.data.status;
      $scope.mappingPair = tmp.slice(0);
      originalMappingPair = tmp.slice(0);

    }, function () {
    });

    $scope.editRow = function(flag, oldC, newC) {
      $scope.hideform = false;
      if (flag === 'N') {
        $scope.edit = true;
        }
      else {
        $scope.edit = false;
        $scope.currentSelection.oldCol = oldC;
        $scope.currentSelection.newCol = newC;
        $scope.currentSelection.row_id = flag;
      }
    };

    $scope.saveEdit = function (index){
      if (index > -1) {
        var tmp = {
          'oldCol':$scope.currentSelection.oldCOl,
          'newCol':$scope.currentSelection.newCol
        };
        $scope.mappingPair.splice(index, 1);
        $scope.mappingPair.splice(index, 0 , tmp);
        //$scope.dataPair[index].program = $scope.currentSelection.program;
        //$scope.dataPair[index].record_mode = $scope.currentSelection.record_mode;
      }
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.oldCol = '';
      $scope.currentSelection.newCOl = '';
      console.log (originalMappingPair.length);
    };

    $scope.saveNew = function () {
      var tmp = {
        'oldCol':$scope.currentSelection.oldCOl,
        'newCol':$scope.currentSelection.newCol
      };
      $scope.mappingPair.push(tmp);
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.oldCol = '';
      $scope.currentSelection.newCOl = '';
      console.log (originalDataPair.length);
    };

    $scope.doResetData = function (){
      $scope.dataPair = originalDataPair.slice(0);

      $scope.edit = true;
      $scope.hideform = true;
      $scope.currentSelection.row_id = '';
      $scope.currentSelection.oldCol = '';
      $scope.currentSelection.newCOl = '';
    };

    $scope.deleteRow = function (id){
      var index = get_index(id);
      if (index > -1) {
          $scope.dataPair.splice(index, 1);
      }
    };

    $scope.doSaveMappingToDB = function (){
      $http.post('http://localhost:5000/set$colmn$mapping$pair', $scope.dataPair).then (function (response) {
        var tmp = response.data.status;

        $http.get('http://localhost:5000/get$program$recordmode$pair').then (function (response) {
          var tmp = response.data.status;
          $scope.mappingPair = [];
          originalMappingPair = [];
          $scope.mappingPair = response.data.status;
          for (var i = 0; i < tmp.length; i++){
            originalMappingPair.push(tmp[i]);
          }
        }, function () {
        });

        $scope.showSimpleToast(tmp);
      }, function () {
      });
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
    };

  });
