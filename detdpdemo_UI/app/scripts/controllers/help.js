'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:AboutCtrl
 * @description
 * # AboutCtrl
 * Controller of the detdpdemoApp
 */

angular.module('detdpdemoApp')
  .controller('helpCtrl', function ($scope, $location, $anchorScroll) {
    $scope.scrollTo = function(id) {
          $location.hash(id);
          $anchorScroll();
       }
  });
