'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('ConcatWorkFileCtrl', function ($scope, $http, $mdToast, $mdDialog, usSpinnerService) {

    $scope.search = {
      exp_user :'*',
      start_date:'',
      end_date:'',
      s_y: '',
      s_m: '',
      s_d: '',
      e_y: '',
      e_m: '',
      e_d: ''
    };
    $scope.expSelection = [];
    $scope.ShownPeriod = "3";

    $scope.showFlag = true;

    var todayDate = new Date();
    $scope.maxDate = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() + 1
    );

    $scope.onlyLaterDate = function (date) {
      var day = date;
      return day >= $scope.search.start_date;
    };
    $scope.onShowPeriodChanged = function (){
      $scope.search.start_date = '';
      $scope.search.end_date = '';
      $scope.search.s_y = '';
      $scope.search.s_m = '';
      $scope.search.s_d = '';
      $scope.search.e_y = '';
      $scope.search.e_m = '';
      $scope.search.e_d = '';

      var criteria = {
        shownPeriod: $scope.ShownPeriod,
        exp_user: '*'
      };

      $http.post('/get$work$file$summary', criteria).then(function(response){
          $scope.workFileInfo = response.data.status;
      }, function (){

      });
    };

    $scope.doSearchWorkFile = function (){
      if ($scope.search.start_date !== '') {
        $scope.search.s_y = $scope.search.start_date.getFullYear();
        $scope.search.s_m = $scope.search.start_date.getMonth() + 1;
        $scope.search.s_d = $scope.search.start_date.getDate();
      }

      if ($scope.search.end_date !== '') {
        $scope.search.e_y = $scope.search.end_date.getFullYear();
        $scope.search.e_m = $scope.search.end_date.getMonth() + 1;
        $scope.search.e_d = $scope.search.end_date.getDate();
      }
      $http.post('/search$work$file$summary', $scope.search).then(function(response){
          $scope.workFileInfo = response.data.status;
      }, function (){

      });

    };

    $scope.doResetInput = function(){
      $scope.search.start_date = '';
      $scope.search.end_date = '';
      $scope.search.s_y = '';
      $scope.search.s_m = '';
      $scope.search.s_d = '';
      $scope.search.e_y = '';
      $scope.search.e_m = '';
      $scope.search.e_d = '';

    }

    $scope.doAddExp = function(){
      var tmp = {
        'exp_no': '',
        'sub_exps' : ''
      };

      $scope.expSelection.push(tmp);
    }

    $scope.doDelExp = function(index){
      if (index >=-1){
        $scope.expSelection.splice(index, 1);
      }
    };

    $scope.doConcatWorkFile = function(){
      usSpinnerService.spin('concatSpinner');
      $http.post('/concat$work$file', $scope.expSelection).then (function (response) {
        usSpinnerService.stop('concatSpinner');
        var result = response.data.status.comment;
        var file_name = response.data.status.file_name;

        $scope.showSimpleToast(result);

        var alert =  $mdDialog.confirm()
                     .parent(angular.element(document.querySelector('#popupContainer')))
                     .title(file_Name)
                     .ok('Got it!');
         $mdDialog.show(alert);
      }, function () {
      });
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
    };

  });
