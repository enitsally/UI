'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('RetrieveCtrl', function ($scope, $http) {
    $scope.search = {
      'doe_name': '',
      'doe_descr': '',
      'doe_comment': '',
      'doe_program': '',
      'doe_record_mode': '',
      'doe_read_only': '',
      'doe_start_date': '',
      'doe_end_date': '',
      's_y': '',
      's_m': '',
      's_d': '',
      'e_y': '',
      'e_m': '',
      'e_d': ''
    };


    $scope.retrieve = {
      'fullCol' : false,
      'cusCol' : false,
      'stdCol': true,
      'record_mode': '',
      'program' : '',
      'read_only' : '',
      'full_device' : '',
      'doe_no': '',
      'design_no' : '',
      'email' : '',
      'params': ''
    };
    $scope.showFlag = false;
    $scope.currentParam;
    $scope.paramsList;
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
    }


    $http.get('http://localhost:5000/get$record$mode').then (function (response) {
      $scope.recordmode_list = response.data.status;
    }, function () {
    });

    $http.get('http://localhost:5000/get$program').then (function (response) {
      $scope.program_list = response.data.status;
    }, function () {
    });

    $scope.doResetSelection = function () {
      $scope.search = {
        'doe_name': '',
        'doe_descr': '',
        'doe_comment': '',
        'doe_program': '',
        'doe_record_mode': '',
        'doe_read_only': '',
        'doe_start_date': '',
        'doe_end_date': '',
        's_y': '',
        's_m': '',
        's_d': '',
        'e_y': '',
        'e_m': '',
        'e_d': ''
      };
      $scope.doeSearchInfo = [];
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

      $http.post('http://localhost:5000/get$search$summary', $scope.search).then (function (response) {
        $scope.doeSearchInfo = response.data.status;
      }, function () {
      });
    };



    $scope.pageSize = '100';
    $scope.totalSize = 0;
    var content;
    var gridOptions;

    $http.get("http://localhost:5000/get$conf$summary")
      .then(function (res) {
        content = res.data.status.conf_content;
        var colslist = res.data.status.conf_col;
        $scope.paramsList = colslist.slice(0);
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
          enableColResize: true
        };

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
        gridOptions.datasource = dataSource;
        // gridOptions.api.setDatasource (datasource);
        // gridOptions.columnApi.sizeColumnsToFit();

        $scope.gridOptions = gridOptions;
      });

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
        // return dataSource;
    }



    $scope.onPageSizeChanged = function() {
        createNewDatasource();
    }


  });
