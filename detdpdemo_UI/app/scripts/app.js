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
    'angularSpinner',
    'ngIdle'
  ])
  .config(['usSpinnerConfigProvider', function (usSpinnerConfigProvider) {
    usSpinnerConfigProvider.setDefaults({radius:30, width:8, length: 16});
  }])
  .config(['KeepaliveProvider', 'IdleProvider', function(KeepaliveProvider, IdleProvider) {
    IdleProvider.idle(1800);//45mins
    IdleProvider.timeout(5);
    KeepaliveProvider.interval(10);
  }])
  .factory('IdleService', function (Idle, Keepalive) {
    //Here start setting the sidle function
    //--------------------------------------------
    var idleservice = {};
    idleservice.started = false;

    idleservice.start = function() {
      Idle.watch();
      idleservice.started = true;
    };

    idleservice.stop = function() {
      Idle.unwatch();
      idleservice.started = false;

    };
    return idleservice;
  })
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
      .state('sysUploadLog', {
        url: '/sysUploadLog',
        templateUrl: 'views/sys_upload_log.html',
        controller: 'sysUploadLogCtrl',
        controllerAs: 'sysUploadLog'
      })
      .state('fileUploadSetting', {
        url: '/fileUploadSetting',
        templateUrl: 'views/file_upload_setting.html',
        controller: 'fileUploadSettingCtrl',
        controllerAs: 'fileUploadSetting'
      })
      .state('usersetting', {
        url: '/usersetting',
        templateUrl: 'views/user_setting.html',
        controller: 'UserSettingCtrl',
        controllerAs: 'usersetting'
      });
  })

  // .config(function ($httpProvider) {
  //  $httpProvider.interceptors.push([
  //    '$injector',
  //    function ($injector) {
  //      return $injector.get('AuthInterceptor');
  //    }
  //  ]);
  // })
  // .factory('AuthInterceptor', function ($rootScope, $q,
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
  // })
  // .directive('loginDialog', function (AUTH_EVENTS) {
  //  return {
  //    restrict: 'A',
  //   //  template: '<div ng-if="visible" ng-include="\'login.html\'">',
  //    templateUrl: 'views/login.html',
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
  // })
  .controller('ApplicationController', function ($rootScope, $scope, $mdSidenav, $mdToast, $http, $state, USER_ROLES, IdleService) {
    $rootScope.currentUser = null;
    $rootScope.userRoles = USER_ROLES;
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

       $http.get('/logout').then(function(req){
         $scope.showSimpleToast(req.data.status);
       });
        $rootScope.currentUser = null;
        $state.go('login');
        IdleService.stop();
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
       else if (api === 'Standard Setting'){
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
       else if (api === 'File Upload Setting'){
         $state.go('fileUploadSetting');
         $mdSidenav('left').close();
       }
       else if (api === 'File linkage Setting'){
         $state.go('fileLinkSetting');
         $mdSidenav('left').close();
       }
       else if (api === 'System Upload Log'){
         $state.go('sysUploadLog');
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
            icon: 'images/icon/settings.svg'
          },
          {
            link : '',
            title: 'System Upload Log',
            icon: 'images/icon/settings.svg'
          }
    ];
    $scope.admin = [
          {
            link : '',
            title: 'Standard Setting',
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
          },
          {
            link : '',
            title: 'File Upload Setting',
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
  })
  .run(function($rootScope, $location, $state, $mdDialog) {
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
       var isLogin = toState.name === "login";
       if(isLogin){
          return; // no need to redirect
       }

       // now, redirect only not authenticated

       if($rootScope.currentUser === null) {
           e.preventDefault(); // stop current execution
           $state.go('login'); // go to login
       }
     });

     $rootScope.$on('IdleTimeout', function() {
       var alert =  $mdDialog.alert()
                    .parent(angular.element(document.querySelector('#popupContainer')))
                    .clickOutsideToClose(true)
                    .title('Time out, Session Expired!.')
                    .ok('Got it!');
        $mdDialog.show(alert);
        $state.go('login');
     });
  })
  ;
