'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('sysUploadLogCtrl', function ($scope, $http, $mdToast, usSpinnerService) {

    $scope.search = {
      user_name: $scope.currentUser ? $scope.currentUser.id : '',
      // uploaded: true,
      // failed: true,
      // record_mode: '',
      // program:'',
      // read_only:'',
      start_date:'',
      end_date:'',
      s_y: '',
      s_m: '',
      s_d: '',
      e_y: '',
      e_m: '',
      e_d: ''
      // status: [],
      // only_full: []
    };
    $scope.logSearchInfo = [];

    $scope.ShownPeriod = "3";



    var todayDate = new Date();
    $scope.maxDate = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() + 1
    );

    $scope.doReset = function(){
      // $scope.search.uploaded = true;
      // $scope.search.failed = true;
      // $scope.search.record_mode = '';
      // $scope.search.program = '';
      // $scope.search.read_only = true;
      // $scope.search.full_device = true;
      $scope.search.start_date = '';
      $scope.search.end_date = '';
      $scope.search.s_y = '';
      $scope.search.s_m = '';
      $scope.search.s_d = '';
      $scope.search.e_y = '';
      $scope.search.e_m = '';
      $scope.search.e_d = '';

      $scope.doeSearchInfo = [];
    };

    $scope.doSearchLog = function (flag){

      if (flag === 'A'){
        $scope.doReset();
      }

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

      // if ($scope.search.uploaded == true){
      //   $scope.search.status.push('Y');
      // }
      //
      // if ($scope.search.failed == true){
      //   $scope.search.status.push('N');
      // }
      //
      // if ($scope.search.read_only == true){
      //   $scope.search.only_full.push('Y');
      // }
      //
      // if ($scope.search.full_device == true){
      //   $scope.search.only_full.push('N');
      // }


      $http.post('/get$upload$log', $scope.search).then (function (response) {
        $scope.logSearchInfo = response.data.status;
      }, function () {
      });

    };


    $scope.onShowPeriodChanged  = function(){
      var showPeriod = {
                          s_y: '',
                          s_m: '',
                          s_d: '',
                          e_y: '',
                          e_m: '',
                          e_d: ''
                        };
      if ($scope.ShownPeriod === "3"){
          var threeMonthAgo = new Date();
          threeMonthAgo.setMonth(threeMonthAgo.getMonth()-3);

          showPeriod.s_y = threeMonthAgo.getFullYear();
          showPeriod.s_m = threeMonthAgo.getMonth() + 1;
          showPeriod.s_d = threeMonthAgo.getDate();

          showPeriod.e_y = todayDate.getFullYear();
          showPeriod.e_m = todayDate.getMonth() + 1;
          showPeriod.e_d = todayDate.getDate();

      }
      else if ($scope.ShownPeriod === "6"){
          var sixMonthAgo = new Date();
          sixMonthAgo.setMonth(sixMonthAgo.getMonth()-6);

          showPeriod.s_y = sixMonthAgo.getFullYear();
          showPeriod.s_m = sixMonthAgo.getMonth() + 1;
          showPeriod.s_d = sixMonthAgo.getDate();

          showPeriod.e_y = todayDate.getFullYear();
          showPeriod.e_m = todayDate.getMonth() + 1;
          showPeriod.e_d = todayDate.getDate();
      }
      else if ($scope.ShownPeriod === "1"){
          var oneYearAgo = new Date();
          oneYearAgo.setYear(oneYearAgo.getFullYear()-1);

          showPeriod.s_y = oneYearAgo.getFullYear();
          showPeriod.s_m = oneYearAgo.getMonth() + 1;
          showPeriod.s_d = oneYearAgo.getDate();


          showPeriod.e_y = todayDate.getFullYear();
          showPeriod.e_m = todayDate.getMonth() + 1;
          showPeriod.e_d = todayDate.getDate();
      }

      $http.post('/get$upload$log', showPeriod).then (function (response) {
        $scope.logSearchInfo = response.data.status;
      }, function () {
      });
    };

    $scope.doManualUpload = function (){
      usSpinnerService.spin('manualUploadSpinner');
      $http.post('/get$manual$upload').then (function (response) {
        var msg = response.data.status;
        usSpinnerService.stop('manualUploadSpinner');
        $scope.showSimpleToast(msg);
      }, function () {
      });
    };

    $scope.onlyLaterDate = function (date) {
      var day = date;
      return day >= $scope.search.start_date;
    };

    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(3000));
    };
  });
