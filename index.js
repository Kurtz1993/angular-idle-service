angular.module('testApp', ['$idle'])
    .config(function ($keepaliveProvider, $idleProvider) {
        $idleProvider.setTimeoutTime(3);
        $idleProvider.setIdleTime(5);
        $idleProvider.keepalive(true);
        $keepaliveProvider.setInterval(5);
        $keepaliveProvider.http('http://localhost:8080');
    })
    .run(function ($keepalive, $rootScope, $idle) {
        //$keepalive.start();
        $idle.watch();
        $rootScope.$on('$keepalive', function () {
            console.log('Keeping alive...');
        });
        $rootScope.$on('$keepaliveResponse', function (data, status) {
            console.log("Status: " + status);
            console.log(data);
        });
        $rootScope.$on('$userIdle', function () {
            console.log('You are idle...');
        });
        $rootScope.$on('$userTimeout', function () {
            console.log('You timed out');
        });
        $rootScope.$on('$userBack', function () {
            console.log('Now you are not idle');
        });
    });