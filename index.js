angular.module('testApp', ['Idle'])
    .config(function (KeepaliveProvider, IdleProvider) {
        IdleProvider.setTimeoutTime(3);
        IdleProvider.setIdleTime(5);
        IdleProvider.keepalive(true);
        KeepaliveProvider.setInterval(5);
        KeepaliveProvider.http('http://localhost:8080');
    })
    .run(function (Keepalive, $rootScope, IdleLocalStorage, Idle) {
        //Keepalive.start();
        console.log(Idle);
        Idle.watch();
        $rootScope.$on('Keepalive', function () {
            console.log('Keeping alive...');
        });
        $rootScope.$on('KeepaliveResponse', function (data, status) {
            console.log("Status: " + status);
            console.log(data);
        });
        $rootScope.$on('IdleStart', function () {
            console.log('You are idle...');
        });
        $rootScope.$on('IdleTimeout', function () {
            console.log('You timed out');
        });
    });