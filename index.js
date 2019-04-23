angular.module('testApp', ['$idle'])
    .config(function ($keepaliveProvider, $idleProvider) {
        $idleProvider.setTimeoutTime(5);
        $idleProvider.setIdleTime(10);
        $idleProvider.keepalive(false);
        $keepaliveProvider.setInterval(5);
        $keepaliveProvider.http('http://localhost:8080');
    })
    .run(function ($keepalive, $rootScope, $idle) {
        //$keepalive.start();
        console.log($idle)
        $idle.watch();
        $rootScope.$on('$keepalive', function () {
            console.log('Keeping alive...');
        });
        $rootScope.$on('$keepaliveResponse', function (data, status) {
            console.log("Status: ");
            console.log(status);
            console.log(data);
        });
        $rootScope.$on('$userIdle', function () {
            console.log('You are idle...');
            console.log(`You have been idle for ${$idle.getIdleState().userIdleTime} seconds`);
        });
        $rootScope.$on('$userTimeout', function () {
            console.log('You timed out');
        });
        $rootScope.$on('$userBack', function () {
            console.log('Now you are not idle');
        });
    });