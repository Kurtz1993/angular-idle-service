angular
  .module("testApp", ["$idle"])
  .config(function($keepaliveProvider, $idleProvider) {
    $idleProvider.setTimeoutTime(5);
    $idleProvider.setIdleTime(10);
    $idleProvider.keepalive(false);
    $keepaliveProvider.setInterval(5);
    $keepaliveProvider.http("http://localhost:8080");
  })
  .run(function($keepalive, $rootScope, $idle) {
    //$keepalive.start();
    console.log($idle);
    $idle.watch();
    $rootScope.$on("$keepalive", function() {
      console.log("Keeping alive...");
    });
    $rootScope.$on("$keepaliveResponse", function(data, status) {
      console.log("Status: ");
      console.log(status);
      console.log(data);
    });
    $rootScope.$on("$userIdle", function() {
      console.log("You are idle...");
    });
    $rootScope.$on("$userTimeout", function() {
      console.log("You timed out");
    });
    $rootScope.$on("$userBack", function() {
      console.log("Now you are not idle");
    });
    $rootScope.$on("$userActive", function(_, timeIdle) {
      console.log(timeIdle);
      console.log(`You have been idle for ${timeIdle} seconds`);
    });
  })
  .controller("AppController", function($scope, $idle) {
    $scope.unwatch = function unwatch() {
      $idle.unwatch();
    };
    $scope.resume = function resume() {
      $idle.watch();
    };
  });
