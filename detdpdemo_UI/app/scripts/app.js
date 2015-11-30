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
    'ui.router',
    'ngMaterial',
    'angularFileUpload'
  ])
  .config(function ($urlRouterProvider) {
    $urlRouterProvider.otherwise('/login');
  })
  .config(function ($stateProvider) {
    $stateProvider
      .state('login', {
        url: '/login',
        templateUrl: 'views/login.html',
        controller: 'LoginCtrl',
        controllerAs: 'login'
      })
      .state('upload', {
        url: '/upload',
        templateUrl: 'views/upload.html',
        controller: 'UploadCtrl',
        controllerAs: 'upload'
      })
      .state('retrieve', {
        url: '/retrieve',
        templateUrl: 'views/retrieve.html',
        controller: 'RetrieveCtrl',
        controllerAs: 'retrieve'
      })
  })

  //.config(function ($httpProvider) {
  //  $httpProvider.interceptors.push([
  //    '$injector',
  //    function ($injector) {
  //      return $injector.get('AuthInterceptor');
  //    }
  //  ]);
  //})
  //.factory('AuthInterceptor', function ($rootScope, $q,
  //                                      AUTH_EVENTS) {
  //  return {
  //    responseError: function (response) {
  //      $rootScope.$broadcast({
  //        401: AUTH_EVENTS.notAuthenticated,
  //        403: AUTH_EVENTS.notAuthorized,
  //        419: AUTH_EVENTS.sessionTimeout,
  //        440: AUTH_EVENTS.sessionTimeout
  //      }[response.status], response);
  //      return $q.reject(response);
  //    }
  //  };
  //})
  //.directive('loginDialog', function (AUTH_EVENTS) {
  //  return {
  //    restrict: 'A',
  //    template: '<div ng-if="visible" ng-include="\'login.html\'">',
  //    link: function (scope) {
  //      var showDialog = function () {
  //        scope.visible = true;
  //      };
  //
  //      scope.visible = false;
  //      scope.$on(AUTH_EVENTS.notAuthenticated, showDialog);
  //      scope.$on(AUTH_EVENTS.sessionTimeout, showDialog)
  //    }
  //  };
  //})
  .controller('ApplicationController', function ($rootScope, $scope, USER_ROLES, AuthService) {
    $rootScope.currentUser = null;
    $rootScope.userRoles = USER_ROLES;
    $rootScope.isAuthorized = AuthService.isAuthorized;

    $scope.setCurrentUser = function (user) {
      $rootScope.currentUser = user;
    };
  });
