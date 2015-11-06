'use strict';

/**
 * @ngdoc overview
 * @name detdpdemoApp
 * @description
 * # detdpdemoApp
 *
 * Main module of the application.
 */
angular
  .module('detdpdemoApp', [
    'ngRoute'
  ])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .when('/upload', {
        templateUrl: 'views/upload.html',
        controller: 'UploadCtrl',
        controllerAs: 'upload'
      })
      .when('/retrieve', {
        templateUrl: 'views/retrieve.html',
        controller: 'RetrieveCtrl',
        controllerAs: 'retrieve'
      })
      .otherwise({
        redirectTo: '/'
      });
  });
