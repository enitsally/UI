'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('sysSettingCtrl', function ($scope, $http, $mdToast) {
    $scope.admin_setup = {
      admin_name : $scope.currentUser ? $scope.currentUser.id : '',
      std_cols: []
    };

    $scope.showFlag = false;
    $scope.selectedItem = null;
    $scope.searchText = null;

    var comment;
    var sys_std_list=[];

    /**
     * Create filter function for a query string
     */
    function createFilterFor(query) {
      var lowercaseQuery = angular.lowercase(query);

      return function filterFn(colName) {
        return (colName.toLowerCase().indexOf(lowercaseQuery) === 0);
      };
    }

    $http.get('/get$system$setup').then (function (response) {
      $scope.fulllist = response.data.status.full_cols;
      sys_std_list = response.data.status.standard_cols;
	  $scope.selectedStdCols = sys_std_list.slice(0);

    }, function () {
    });

    $scope.setIndex = function (index){
      $scope.selectedIndex = index;
    };

    $scope.doSaveToDB = function(){
      $scope.admin_setup.std_cols = $scope.selectedStdCols;


      $http.post('/get$save$system$setup', $scope.admin_setup).then (function (response) {
        comment = response.data.status;
        $scope.showSimpleToast(comment);

        $http.post('/get$system$setup', $scope.user_setup).then (function (response) {
          sys_std_list = response.data.status.standard_cols;
          $scope.selectedStdCols = sys_std_list.slice(0);
        }, function () {
        });
      }, function () {
      });
    };

    $scope.doGetSysStd = function(){
        $scope.selectedStdCols = sys_std_list.slice(0);

    };

    $scope.transformChip = function (chip){
      if (angular.isObject(chip)) {
        return chip;
      }
    // Otherwise, create a new one
    // return { name: chip, type: 'new' }
    };


    $scope.querySearch = function (query) {
      var results = query ?   $scope.fulllist.filter(createFilterFor(query)) : [];
      return results;
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
    };

  });
