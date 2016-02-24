'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('RetrieveCtrl', function ($scope, $http, $mdToast, $mdDialog, $mdMedia, usSpinnerService) {
    $scope.customFullscreen = $mdMedia('gt-sm') || $mdMedia('gt-lg');
    $scope.criteria = {
      fullCol : false,
      cusCol : false,
      stdCol: true,
      record_mode: '',
      program : '',
      readonly : true,
      fulldevice : false,
      doe_no: '',
      design_no : '',
      email : '',
      user_name: $scope.currentUser ? $scope.currentUser.id : ''
    };

    $scope.search = {
      doe_name: '',
      doe_descr: '',
      doe_comment: '',
      doe_program: '',
      doe_record_mode: '',
      doe_read_only: '',
      doe_start_date: '',
      doe_end_date: '',
      s_y: '',
      s_m: '',
      s_d: '',
      e_y: '',
      e_m: '',
      e_d: ''
    };

    $scope.showFlag = false;
    $scope.currentParam = '';
    $scope.paramsList = [];
    $scope.paramsSelection=[];
    $scope.ShownPeriod = "3";
    $scope.confShownPeriod = "3";

    var todayDate = new Date();
    $scope.maxDate = new Date(
      todayDate.getFullYear(),
      todayDate.getMonth(),
      todayDate.getDate() + 1
    );

    $scope.onlyLaterDate = function (date) {
      var day = date;
      return day > $scope.search.doe_start_date;
    };

    $scope.setIndex = function (index){
      $scope.selectedIndex = index;
    };

    $scope.doAddParam = function (){
      var tmp = {
        key: $scope.currentParam,
        value: ''
      };

      $scope.paramsSelection.push(tmp);
      $scope.currentParam = '';
    };

    $scope.doDelParam = function(index){
      if (index >=-1){
        $scope.paramsSelection.splice(index, 1);
      }
    };


    $http.get('/get$record$mode').then (function (response) {
      $scope.recordmode_list = response.data.status;
    }, function () {
    });

    $http.get('/get$program').then (function (response) {
      $scope.program_list = response.data.status;
    }, function () {
    });

    $scope.doResetSelection = function () {
      if ($scope.selectedIndex === 0)
      {
        $scope.search = {
          doe_name: '',
          doe_descr: '',
          doe_comment: '',
          doe_program: '',
          doe_record_mode: '',
          doe_read_only: '',
          doe_start_date: '',
          doe_end_date: '',
          s_y: '',
          s_m: '',
          s_d: '',
          e_y: '',
          e_m: '',
          e_d: ''
        };
        $scope.onShowPeriodChanged();
      }
      if ($scope.selectedIndex === 1){
        $scope.criteria = {
          fullCol : false,
          cusCol : false,
          stdCol: true,
          record_mode: '',
          program : '',
          readonly : true,
          fulldevice : false,
          doe_no: '',
          design_no : '',
          email : '',
          user_name: $scope.currentUser ? $scope.currentUser.id : ''
        };
        $scope.currentParam = '';
        $scope.paramsSelection = [];
      }

    };

    $scope.doSearchSummary = function () {
      if ($scope.search.doe_start_date !== '') {
        $scope.search.s_y = $scope.search.doe_start_date.getFullYear();
        $scope.search.s_m = $scope.search.doe_start_date.getMonth() + 1;
        $scope.search.s_d = $scope.search.doe_start_date.getDate();
      }

      if ($scope.search.doe_end_date !== '') {
        $scope.search.e_y = $scope.search.doe_end_date.getFullYear();
        $scope.search.e_m = $scope.search.doe_end_date.getMonth() + 1;
        $scope.search.e_d = $scope.search.doe_end_date.getDate();
      }

      $http.post('/get$search$summary', $scope.search).then (function (response) {
        $scope.doeSearchInfo = response.data.status;
      }, function () {
      });
    };

    $scope.onShowPeriodChanged = function (){
      var showPeriod = {
        doe_name: '',
        doe_descr: '',
        doe_comment: '',
        doe_program: '',
        doe_record_mode: '',
        doe_read_only: '',
        doe_start_date: '',
        doe_end_date: '',
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

      $http.post('/get$search$summary', showPeriod).then (function (response) {
        $scope.doeSearchInfo = response.data.status;
      }, function () {
      });

    };

    $scope.doRetrieveFile = function (){
      usSpinnerService.spin('retrievingSpinner');
      $scope.criteria['params'] = [];
      $scope.criteria['read_only'] = [];
      $scope.criteria['flag'] = [];

      if ($scope.criteria.fullCol === true){
        $scope.criteria.flag.push('F');
      }

      if ($scope.criteria.cusCol === true){
        $scope.criteria.flag.push('C');
      }

      if ($scope.criteria.stdCol === true){
        $scope.criteria.flag.push('S');
      }
      if ($scope.paramsSelection.length > 0){
        for (var i = 0; i < $scope.paramsSelection.length; i++){
          var obj = {};
            obj[$scope.paramsSelection[i].key] = $scope.paramsSelection[i].value;
            $scope.criteria.params.push(obj);
        }
      }

      if ($scope.criteria.readonly){
        $scope.criteria.read_only.push('y');
      }

      if ($scope.criteria.fulldevice){
        $scope.criteria.read_only.push('n');
      }

      $http.post('/get$file$retrieve', $scope.criteria).then (function (response) {
        usSpinnerService.stop('retrievingSpinner');
        var retrieveResult = response.data.status.comment;
        var std = response.data.status.std_file;
        var cus = response.data.status.cus_file;
        var full = response.data.status.full_file;
        $scope.correlation = response.data.status.correlation;
        $scope.showSimpleToast(retrieveResult);
        var fileName = '';

        if ($scope.criteria.fullCol === true ){
          fileName = fileName + full + ';';

        }
        if ($scope.criteria.cusCol === true){
          fileName = fileName + cus + ';';

        }
        if ($scope.criteria.stdCol === true && std !== undefined){
          fileName = fileName + std + ';';

        }

        if (fileName.length !==0){
          var confirm =  $mdDialog.confirm()
                       .parent(angular.element(document.querySelector('#popupContainer')))
                       .ariaLabel('Lucky day')
                       .title(fileName)
                       .ok('See plotting!')
                       .cancel('No, Finished.');
          $mdDialog.show(confirm).then(function() {
              var useFullScreen = ($mdMedia('sm') || $mdMedia('xs'))  && $scope.customFullscreen;
              $mdDialog.show({
                templateUrl: 'views/correlation_plot.html',
                parent: angular.element(document.body),
                clickOutsideToClose: false,
                locals: {
                  corr: $scope.correlation.result_dict,
                  info: $scope.correlation.corr_info
                },
                scope: $scope,        // use parent scope in template
                preserveScope: true,
                fullscreen: useFullScreen,
                controller: DialogController
              });

              $scope.$watch(function() {
                  return $mdMedia('xs') || $mdMedia('sm');
                }, function(wantsFullScreen) {
                  $scope.customFullscreen = (wantsFullScreen === true);
                });

              function DialogController($scope, $mdDialog, corr, info) {
                $scope.items = corr;
                $scope.info = info;
                $scope.cancel = function() {
                  $mdDialog.cancel();
                };

                $scope.expert = function(){

                };
              };
            }, function() {
                }
          );
        }

      });


    };



    $scope.pageSize = '100';
    $scope.totalSize = 0;
    $scope.gridOptions;
    var content;
    var gridOptions;


    $http.post("/get$conf$summary", $scope.confShownPeriod).then(function (res) {
        content = res.data.status.conf_content;
        var colslist = res.data.status.conf_col;
        var noparam = ['program', 'record_mode', 'read_only', 'doe_name','doe#', 'design', 'wafer'];
        var diff = $(colslist).not(noparam).get();
        $scope.paramsList = diff.slice(0);
        $scope.totalSize = content.length;
        var colHead = [];
        for (var i = 0; i < colslist.length; i++) {
          var tmp = {
            headerName: colslist[i],
            field: colslist[i],
            filter: 'text',
            filterParams: {apply: true}
          };
          colHead.push(tmp);
        }

        gridOptions = {
          rowData: content,
          columnDefs: colHead,
          enableFilter: true,
          enableSorting: true,
          enableColResize: true,
          rowSelection: 'single'
        };

        var dataSource = {
            //rowCount: ???, - not setting the row count, infinite paging will be used
            pageSize: parseInt($scope.pageSize), // changing to number, as scope keeps it as a string
            getRows: function (params) {
                // this code should contact the server for rows. however for the purposes of the demo,
                // the data is generated locally, a timer is used to give the experience of
                // an asynchronous call
                //console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                setTimeout( function() {
                    // take a chunk of the array, matching the start and finish times
                    var rowsThisPage = content.slice(params.startRow, params.endRow);
                    // see if we have come to the last page. if we have, set lastRow to
                    // the very last row of the last page. if you are getting data from
                    // a server, lastRow could be returned separately if the lastRow
                    // is not in the current page.
                    var lastRow = -1;
                    if (content.length <= params.endRow) {
                        lastRow = content.length;
                    }
                    params.successCallback(rowsThisPage, lastRow);
                }, 500);
            }
        };
        gridOptions.datasource = dataSource;
        $scope.gridOptions = gridOptions;

      });

    $scope.onConfShowPeriodChanged = function (){
      $http.post("/get$conf$summary", $scope.confShownPeriod).then(function (res) {
          content = res.data.status.conf_content;
          var colslist = res.data.status.conf_col;
          var noparam = ['program', 'record_mode', 'read_only', 'doe_name','doe#', 'design', 'wafer'];
          var diff = $(colslist).not(noparam).get();
          $scope.paramsList = diff.slice(0);
          $scope.totalSize = content.length;
          var colHead = [];
          for (var i = 0; i < colslist.length; i++) {
            var tmp = {
              headerName: colslist[i],
              field: colslist[i],
              filter: 'text',
              filterParams: {apply: true}
            };
            colHead.push(tmp);
          }
          var dataSource = {
              //rowCount: ???, - not setting the row count, infinite paging will be used
              pageSize: parseInt($scope.pageSize), // changing to number, as scope keeps it as a string
              getRows: function (params) {
                  // this code should contact the server for rows. however for the purposes of the demo,
                  // the data is generated locally, a timer is used to give the experience of
                  // an asynchronous call
                  //console.log('asking for ' + params.startRow + ' to ' + params.endRow);
                  setTimeout( function() {
                      // take a chunk of the array, matching the start and finish times
                      var rowsThisPage = content.slice(params.startRow, params.endRow);
                      // see if we have come to the last page. if we have, set lastRow to
                      // the very last row of the last page. if you are getting data from
                      // a server, lastRow could be returned separately if the lastRow
                      // is not in the current page.
                      var lastRow = -1;
                      if (content.length <= params.endRow) {
                          lastRow = content.length;
                      }
                      params.successCallback(rowsThisPage, lastRow);
                  }, 500);
              }
          };
          $scope.gridOptions.api.setColumnDefs(colHead);
          $scope.gridOptions.api.setDatasource(dataSource);
    });
  };


      $scope.showSimpleToast = function(showmgs) {
          $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
      };

      function createNewDatasource() {
          if (!content) {
              // in case user selected 'onPageSizeChanged()' before the json was loaded
              return;
          }

          var dataSource = {
              //rowCount: ???, - not setting the row count, infinite paging will be used
              pageSize: parseInt($scope.pageSize), // changing to number, as scope keeps it as a string
              getRows: function (params) {
                  // this code should contact the server for rows. however for the purposes of the demo,
                  // the data is generated locally, a timer is used to give the experience of
                  // an asynchronous call
                  setTimeout( function() {
                      // take a chunk of the array, matching the start and finish times
                      var rowsThisPage = content.slice(params.startRow, params.endRow);
                      // see if we have come to the last page. if we have, set lastRow to
                      // the very last row of the last page. if you are getting data from
                      // a server, lastRow could be returned separately if the lastRow
                      // is not in the current page.
                      var lastRow = -1;
                      if (content.length <= params.endRow) {
                          lastRow = content.length;
                      }
                      params.successCallback(rowsThisPage, lastRow);
                  }, 500);
              }
          };

          $scope.gridOptions.api.setDatasource(dataSource);
      }

    $scope.onPageSizeChanged = function() {
        createNewDatasource();
    };

  });
