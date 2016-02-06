'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
  angular.module('detdpdemoApp')
    .controller('userSettingCtrl', function ($scope, $http, $mdToast) {

      $scope.user_setup = {
        user_name : $scope.currentUser ? $scope.currentUser.id : '',
        std_cols: [],
        cus_cols:[]
      };

      $scope.showFlag = false;
      $scope.selectedItem = null;
      $scope.searchText = null;

      var comment;
      var sys_std_list;
      var org_std_cols;
      var org_cus_cols;

      /**
       * Create filter function for a query string
       */
      function createFilterFor(query) {
        var lowercaseQuery = angular.lowercase(query);

        return function filterFn(colName) {
          // return (colName.name.toLowerCase().indexOf(lowercaseQuery) === 0) ||
          //     (colName.type.toLowerCase().indexOf(lowercaseQuery) === 0);
          return (colName.toLowerCase().indexOf(lowercaseQuery) === 0);
        };
      }

      $http.get('/get$system$setup').then (function (response) {
        $scope.fulllist = response.data.status.full_cols;
        // sys_std_list = response.data.status.standard_cols.slice(0);
        sys_std_list = response.data.status.standard_cols.slice(0);
      }, function () {
      });

      $http.post('/get$user$setup', $scope.user_setup).then (function (response) {
        $scope.selectedStdCols = response.data.status.standard_cols.slice(0);
        $scope.selectedCusCols = response.data.status.customized_cols.slice(0);
        org_std_cols = response.data.status.standard_cols.slice(0);
        org_cus_cols = response.data.status.customized_cols.slice(0);
        comment = response.data.status.cus_comment + response.data.status.std_comment;
        // $scope.selectedStdCols = user_standard_cols;
        // $scope.selectedCusCols = user_customized_cols;
        $scope.showSimpleToast(comment);
      }, function () {
      });

      $scope.setIndex = function (index){
        $scope.selectedIndex = index;
      };

      $scope.doResetToUserProf = function(){
        if ($scope.selectedIndex === 1){
          $scope.selectedCusCols = org_cus_cols.slice(0);
        }
        if ($scope.selectedIndex === 0){
            $scope.selectedStdCols = org_std_cols.slice(0);
        }
      };

      $scope.doSaveToDB = function(){
        $scope.user_setup.std_cols = $scope.selectedStdCols.slice(0);
        $scope.user_setup.cus_cols = $scope.selectedCusCols.slice(0);

        $http.post('/get$save$setup', $scope.user_setup).then (function (response) {
          comment = response.data.status.cus_comment + '\n' +  response.data.status.std_comment;
          $scope.showSimpleToast(comment);

          $http.post('/get$user$setup', $scope.user_setup).then (function (response) {
            $scope.selectedStdCols = response.data.status.standard_cols.slice(0);
            $scope.selectedCusCols = response.data.status.customized_cols.slice(0);
            org_std_cols = response.data.status.standard_cols.slice(0);
            org_cus_cols = response.data.status.customized_cols.slice(0);
            comment = response.data.status.cus_comment + '\n' +  response.data.status.std_comment;
            console.log(comment);
            // $scope.selectedStdCols = user_standard_cols;
            // $scope.selectedCusCols = user_customized_cols;
          }, function () {
          });
        }, function () {
        });
      };

      $scope.doGetSysStd = function(){
        if ($scope.selectedIndex === 1){
          $scope.selectedCusCols = sys_std_list.slice(0);
        }

        if ($scope.selectedIndex === 0){
          $scope.selectedStdCols = sys_std_list.slice(0);
        }
      };

      $scope.transformChip = function (chip){
        if (angular.isObject(chip)) {
          return chip;
        }

      };

      /**
       * Search for vegetables.
       */
      $scope.querySearch = function (query) {
        var results = query ?   $scope.fulllist.filter(createFilterFor(query)) : [];
        return results;
      };

      $scope.showSimpleToast = function(showmgs) {
        $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
      };



    });
