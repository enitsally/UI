'use strict';

/**
 * @ngdoc overview
 * @name detdpdemoApp
 * @description
 * # detdpdemoApp
 *
 * Main module of the application;
 */
angular
  .module('detdpdemoApp', [
    'ui.router',
    'ngMaterial',
    'angularFileUpload',
    'agGrid',
    'angularSpinner'
  ])
  .config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({radius:30, width:8, length: 16});
  }])
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
      .state('sysSetting', {
        url: '/sysSetting',
        templateUrl: 'views/sys_setting.html',
        controller: 'sysSettingCtrl',
        controllerAs: 'sysSetting'
      })
      .state('dataSetting', {
        url: '/dataSetting',
        templateUrl: 'views/data_setting.html',
        controller: 'dataSettingCtrl',
        controllerAs: 'dataSetting'
      })
      .state('colMapping', {
        url: '/colMapping',
        templateUrl: 'views/col_mapping.html',
        controller: 'colMappingCtrl',
        controllerAs: 'colMapping'
      })
      .state('usersetting', {
        url: '/usersetting',
        templateUrl: 'views/user_setting.html',
        controller: 'UserSettingCtrl',
        controllerAs: 'usersetting'
      });
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
  .controller('ApplicationController', function ($rootScope, $scope, $mdSidenav, $mdToast, $http, $state, USER_ROLES, AuthService) {
    $rootScope.currentUser = null;
    $rootScope.userRoles = USER_ROLES;
    $rootScope.isAuthorized = AuthService.isAuthorized;

    /**
     * Build handler to open/close a SideNav; when animation finishes
     * report completion in console
     */
    function buildDelayedToggler(navID) {
      return debounce(function() {
        $mdSidenav(navID)
          .toggle()
          .then(function () {
            $log.debug("toggle " + navID + " is done");
          });
      }, 200);
    }

    $scope.setCurrentUser = function (user) {
      $rootScope.currentUser = user;
    };

    $scope.toggleSidenav = function(menuId) {
      $mdSidenav(menuId).toggle();
    };
    $scope.toggleLeft = buildDelayedToggler('left');
    $scope.isOpenLeft = function(){
      return $mdSidenav('left').isOpen();
    };

    $scope.close = function () {
     $mdSidenav('left').close()
       .then(function () {
       });
   };
   $scope.doLogout = function(){

     $http.get('http://localhost:5000/logout').then(function(req){
       $scope.showSimpleToast(req.data.status);
     });
      $rootScope.currentUser = null;
      $state.go('login');
   };

   $scope.doDirectLogin = function(){
     $rootScope.currentUser = null;
     $state.go('login');
   };

   $scope.doDirectPage = function (api){
     if (api === 'Upload'){
       $state.go('upload');
       $mdSidenav('left').close();
     }
     else if (api === 'Retrieve'){
       $state.go('retrieve');
       $mdSidenav('left').close();
     }
     else if (api === 'User Setting'){
       $state.go('usersetting');
       $mdSidenav('left').close();
     }
     else if (api === 'System Setting'){
       $state.go('sysSetting');
       $mdSidenav('left').close();
     }
     else if (api === 'Data Setting'){
       $state.go('dataSetting');
       $mdSidenav('left').close();
     }
     else if (api === 'Column Mapping'){
       $state.go('colMapping');
       $mdSidenav('left').close();
     }
   };

   $scope.showSimpleToast = function(showmgs) {
     $mdToast.show($mdToast.simple().content(showmgs).position('bottom right').hideDelay(1000));
 };
   /**
     * Supplies a function that will continue to operate until the
     * time is up.
     */
    function debounce(func, wait, context) {
      var timer;

      return function debounced() {
        var context = $scope,
            args = Array.prototype.slice.call(arguments);
        $timeout.cancel(timer);
        timer = $timeout(function() {
          timer = undefined;
          func.apply(context, args);
        }, wait || 10);
      };
    }


    $scope.menu = [
          {
            link : '',
            title: 'Upload',
            icon: 'images/icon/uploadfile.svg'
          },
          {
            link : '',
            title: 'Retrieve',
            icon: 'images/icon/getfile.svg'
          },
          {
            link : '',
            title: 'User Setting',
            icon: 'images/icon/setting.svg'
          }
    ];
    $scope.admin = [
          {
            link : '',
            title: 'System Setting',
            icon: 'images/icon/ssy_setting.svg'
          },
          {
            link : '',
            title: 'Data Setting',
            icon: 'images/icon/data_setting.svg'
          },
          {
            link : '',
            title: 'Column Mapping',
            icon: 'images/icon/data_setting.svg'
          }
    ];
  })
  .controller('LeftCtrl', function ($scope, $timeout, $mdSidenav, $log) {
    $scope.close = function () {
      $mdSidenav('left').close()
        .then(function () {
          $log.debug("close LEFT is done");
        });

    };
  });
