'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('RetrieveCtrl', function ($scope, $http ) {
      $scope.search = {
        'doe_name':'',
        'doe_descr':'',
        'doe_comment':'',
        'doe_program':'',
        'doe_record_mode':'',
        'doe_read_only':'',
        'doe_start_date': '',
        'doe_end_date':'',
        's_y':'',
        's_m':'',
        's_d':'',
        'e_y':'',
        'e_m':'',
        'e_d':''
      };
      var todayDate = new Date();
      $scope.maxDate = new Date(
        todayDate.getFullYear(),
        todayDate.getMonth(),
        todayDate.getDate()+1
      );

      $scope.onlyLaterDate = function(date) {
        var day = date;
        return day > $scope.search.doe_start_date;
      };


      $http.get('http://localhost:5000/get$record$mode').then (function (response) {
        $scope.recordmode_list = response.data.status;
      }, function () {
      });

      $http.get('http://localhost:5000/get$program').then (function (response) {
        $scope.program_list = response.data.status;
      }, function () {
      });

      $scope.doResetSelection = function (){
        $scope.search = {
          'doe_name':'',
          'doe_descr':'',
          'doe_comment':'',
          'doe_program':'',
          'doe_record_mode':'',
          'doe_read_only':'',
          'doe_start_date': '',
          'doe_end_date':'',
          's_y':'',
          's_m':'',
          's_d':'',
          'e_y':'',
          'e_m':'',
          'e_d':''
        };
        $scope.doeSearchInfo = [];
      };

      $scope.doSearchSummary = function (){
        if ($scope.search.doe_start_date !== ''){
          $scope.search.s_y = $scope.search.doe_start_date.getFullYear();
          $scope.search.s_m = $scope.search.doe_start_date.getMonth()+1;
          $scope.search.s_d = $scope.search.doe_start_date.getDate();
        }

        if ($scope.search.doe_end_date !== ''){
          $scope.search.e_y = $scope.search.doe_end_date.getFullYear();
          $scope.search.e_m = $scope.search.doe_end_date.getMonth()+1;
          $scope.search.e_d = $scope.search.doe_end_date.getDate();
        }

        $http.post('http://localhost:5000/get$search$summary', $scope.search).then (function (response){
          $scope.doeSearchInfo = response.data.status;
        }, function () {
        });
      };

      // var columnDefs = [
      //   {headerName: "Athlete", field: "athlete", width: 150,
      //       filter: 'text',
      //       filterParams: { apply: true }
      //   },
      //   {headerName: "Age", field: "age", width: 90,
      //       filter: 'number',
      //       filterParams: { apply: true }
      //   },
      //   {headerName: "Country", field: "country", width: 120,
      //       filter: 'set',
      //       filterParams: { apply: true }
      //   },
      //   {headerName: "Year", field: "year", width: 90},
      //   {headerName: "Date", field: "date", width: 110},
      //   {headerName: "Sport", field: "sport", width: 110},
      //   {headerName: "Gold", field: "gold", width: 100, filter: 'number'},
      //   {headerName: "Silver", field: "silver", width: 100, filter: 'number'},
      //   {headerName: "Bronze", field: "bronze", width: 100, filter: 'number'},
      //   {headerName: "Total", field: "total", width: 100, filter: 'number'}
      // ];
      $http.get("http://localhost:5000/get$conf$summary")
          .then(function(res){
              var content = res.data.status.conf_content;
              var colslist = res.data.status.conf_col;
              $scope.columnDefsRD = [];
              for (var cols in colslist){
                  $scope.columnDefsRD.push(
                    {
                        headerName: colslist[cols], field: colslist[cols],
                        filter: 'text',
                        filterParams: { apply: true }
                    }
                  );
              }
          });
      $scope.gridOptions = {
        columnDefs: $scope.columnDefsRD,
        rowData: null,
        enableFilter: true,
        onBeforeFilterChanged: function() {console.log('onBeforeFilterChanged');},
        onAfterFilterChanged: function() {console.log('onAfterFilterChanged');},
        onFilterModified: function() {console.log('onFilterModified');}
      };

  });
