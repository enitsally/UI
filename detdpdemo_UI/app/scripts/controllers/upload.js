'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */
angular.module('detdpdemoApp')
  .controller('UploadCtrl', function ($scope, $http, $state, $mdDialog) {
    $scope.file = {
      doe_name:'',
      doe_descr:'',
      doe_comment:'',
      doe_program:'',
      doe_record_mode: '',
      doe_read_only:''
    };
  // $scope.program_list = [
  //     {'record_mode':'CMR','program':'Apollo'},
  //     {'record_mode':'CMR','program':'Rembrandt'},
  //     {'record_mode':'CMR','program':'Monet'},
  //     {'record_mode':'SMR','program':'Spyglass'},
  //     {'record_mode':'SMR','program':'Watson'},
  //     {'record_mode':'SMR','program':'Laguna'}
  //   ];
  // $scope.recordmode_list = [
  //        "CMR",
  //        "SMR"
  //    ];
  $http.get('http://localhost:5000/get$record$mode').then (function(response){
      $scope.recordmode_list = response.data.status;
  }, function(response){
  });

  $http.get('http://localhost:5000/get$program').then (function(response){
      $scope.program_list = response.data.status;
  }, function(response){
  });

  $scope.doOverview= function (){
       $http.get('http://localhost:5000/get$overview').then(function(response){
         var loginResult = response.data.status;
       },function(response){
       })
     }
  $scope.showAdvanced = function(ev) {
       $mdDialog.show({
         templateUrl: 'views/upload_overview.html',
         parent: angular.element(document.body),
         targetEvent: ev,
         clickOutsideToClose:true,
         controller: 'UploadOverviewCtrl'
       })
       .then(function(answer) {
       }, function() {
       });
     };
  });
