/**
 * @fileoverview Angular.js Services.
 * @author Jonathan Zacsh <jzacsh@gmail.com>
 */

var jzacsh = jzacsh || {};

jzacsh.app = angular.module('jzacshCom', []);

jzacsh.app.config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
  $routeProvider
      .when('/about', {
        templateUrl: '/static/html/about.html',
        controller: jzacsh.AboutPageCtrl,
      })
      .when('/drawings', {
        templateUrl: '/static/html/drawings.html',
        controller: jzacsh.DrawingsPageCtrl,
      })
      .when('/beer', {
        templateUrl: '/static/html/beer.html',
        controller: jzacsh.BeerPageCtrl,
      })
      .otherwise({ redirectTo: '/about' });

  // Deep linking
  // $locationProvider.html5Mode(true);
}]);

jzacsh.app.controller('MainCtrl', function($scope) {
  $scope.partials = {
    banner: '/static/html/banner.html',
    footer: '/static/html/footer.html',
  };
  $scope.$on('$viewContentLoaded', jzacsh.legacyCode);
});

jzacsh.app.controller('BannerCtrl', jzacsh.BannerCtrl);
jzacsh.app.controller('FooterCtrl', jzacsh.FooterCtrl);
