'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('RetrieveCtrl', function ($scope, $http, $mdToast, $mdDialog, usSpinnerService) {

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

    $scope.doAddParam = function (){
      var tmp = {
        'key': $scope.currentParam,
        'value' : ''

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
      $scope.doeSearchInfo = [];

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
        $scope.showSimpleToast(retrieveResult);
        var fileName = '';
        if ($scope.criteria.fullCol === true){
          fileName = fileName + full + ';';
        }
        if ($scope.criteria.cusCol === true){
          fileName = fileName + cus + ';'
        }
        if ($scope.criteria.stdCol === true){
          fileName = fileName + std + ';'
        }

        var alert =  $mdDialog.confirm()
                     .parent(angular.element(document.querySelector('#popupContainer')))
                     .title(fileName)
                     .ok('Got it!');
         $mdDialog.show(alert);
      }, function () {
      });
    };



    $scope.pageSize = '100';
    $scope.totalSize = 0;
    var content;
    var gridOptions;

    $http.get("/get$conf$summary")
      .then(function (res) {
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
                console.log('asking for ' + params.startRow + ' to ' + params.endRow);
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
