'use strict';

/**
 * @ngdoc function
 * @name detdpdemoApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the detdpdemoApp
 */
// angular.module('detdpdemoApp')
//   .controller('MainCtrl', function () {
//     this.awesomeThings = [
//       'HTML5 Boilerplate',
//       'AngularJS',
//       'Karma'
//     ];
//   });

angular.module('detdpdemoApp')
  .controller('LoginCtrl', function ($scope, $rootScope, $http, $state, $mdToast, AUTH_EVENTS, AuthService, IdleService) {
    $scope.credentials = {
      username: '',
      password: ''
    };

    //$scope.doLogin = function () {
    //
    //  $http.post('http://localhost:5000/login', $scope.user).then(function (response) {
    //    var loginResult = response.data.status;
    //    if (loginResult == 'R') {
    //      $state.go('retrieve');
    //    }
    //
    //    else if (loginResult == 'U') {
    //      $state.go('upload');
    //    }
    //    else {
    //      $scope.message = "Login failed, please try again."
    //    }
    //  }, function (response) {
    //  })
    //};
    $scope.showSimpleToast = function(showmgs) {
      $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
    };

    $scope.doLogin = function (credentials) {
      AuthService.login(credentials).then(function (user) {
        $rootScope.$broadcast(AUTH_EVENTS.loginSuccess);
        $scope.setCurrentUser(user);
        if (user.role === 'public'){
          $state.go('upload');
          $scope.message = user.id + ", You are logged in.";
          IdleService.start();
        }
        else if(user.role === 'admin'){
          $state.go('dataSetting');
          $scope.message = user.id + ", Admin, You are logged in!";
          IdleService.start();
        }
        else{
          $scope.message = "Login failed, please try again.";
          $scope.setCurrentUser(null);
          $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
        }
        $scope.showSimpleToast($scope.message);
      }, function () {
        $scope.setCurrentUser(null);
        $rootScope.$broadcast(AUTH_EVENTS.loginFailed);
      });
    };
  })
  .factory('AuthService', function ($http) {
    var authService = {};
    authService.login = function (credentials) {
      return $http.post('http://localhost:5000/login', credentials)
        .then(function (response) {
          return response.data.user;
        });
    };

    authService.isAuthenticated = function () {
      return !!Session.userId;
    };

    authService.isAuthorized = function (authorizedRoles) {
      if (!angular.isArray(authorizedRoles)) {
        authorizedRoles = [authorizedRoles];
      }
      return (authService.isAuthenticated() &&
      authorizedRoles.indexOf(Session.userRole) !== -1);
    };

    return authService;
  })
  .constant('AUTH_EVENTS', {
    loginSuccess: 'auth-login-success',
    loginFailed: 'auth-login-failed',
    logoutSuccess: 'auth-logout-success',
    sessionTimeout: 'auth-session-timeout',
    notAuthenticated: 'auth-not-authenticated',
    notAuthorized: 'auth-not-authorized'
  })
  .constant('USER_ROLES', {
    all: '*',
    admin: 'admin',
    public: 'public user'
  });
