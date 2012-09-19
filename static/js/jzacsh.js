/**
 * @fileoverview Angular.js Services.
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */

var jzacsh = jzacsh || {};

jzacsh.app = angular.module('jzacshCom', ['ngResource'])
    .factory('Slides', jzacsh.services.Slides);


// App Config /////////////////////////////////////////

jzacsh.app.config(['$routeProvider', '$locationProvider',
    function($routeProvider, $locationProvider) {
  $routeProvider
      .when('/about', {
        templateUrl: '/static/html/about.html',
        controller: jzacsh.controllers.AboutPageCtrl,
      })
      .when('/drawings', {
        templateUrl: '/static/html/drawings.html',
        controller: jzacsh.controllers.DrawingsPageCtrl,
      })
      .when('/beer', {
        templateUrl: '/static/html/beer.html',
        controller: jzacsh.controllers.BeerPageCtrl,
      })
      .otherwise({ redirectTo: '/about' });

  // Deep linking
  // $locationProvider.html5Mode(true);
}]);


// Controller Declerations ////////////////////////////

jzacsh.app.controller('MainCtrl', function($scope) {
  $scope.partials = {
    banner: '/static/html/banner.html',
    footer: '/static/html/footer.html',
  };
  // only disable while debugging/developing /drawings !! //@TODO: remove me!!    
  // $scope.$on('$viewContentLoaded', jzacsh.legacyCode); //@TODO: uncomment me!!    
});

jzacsh.app.controller('BannerCtrl', jzacsh.controllers.BannerCtrl);
jzacsh.app.controller('FooterCtrl', jzacsh.controllers.FooterCtrl);

