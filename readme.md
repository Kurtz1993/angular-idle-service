# angular-idle-service

## Description
Some applications may need to detect if a user is idle and perform certain actions when this happens like warning them about this inactivity or logging them out of the application for example.

### This module requires AngularJS >=1.2.0

## Installation
You can install the module via `npm install --save angular-idle-service` or `bower install --save angular-idle-service`.


## Usage example
Since angular-idle-service depends on AngularJS to work you need to reference the script after angular.js script and initialize it on your AngularJS application.

```javascript
angular.module('idleApp', ['$idle'])
    .controller('EventsController', function ($scope, $idle) {
        $scope.$on('$userIdle', function () {
            alert('You appear to be idle');
        }); 
    })
    .config(function ($idleProvider, $keepaliveProvider) {
        // The keepalive ping will be sent every 30 seconds.
        $keepaliveProvider.setInterval(30);
        // We will ping the following address to keep the session alive.
        $keepaliveProvider.http('https://my.server/keepalive');
        
        // Set the idle and timeout timers in seconds.
        // User is considered idle if AFK for 4.5 minutes
        $idleProvider.setIdleTime(270);
        // User will timeout at the end of 15 seconds anfter considered idle.
        $idleProvider.setTimeoutTime(15); 
        // The $idle service will ping the specified URL (see $keepaliveProvider.http) to keep the session alive.
        $idleProvider.keepalive(true);
        
    })
    .run(function ($idle) {
        $idle.watch();
    })<
```

## API Reference
### $keepaliveProvider
```typescript
/**
 * Sets the http configurations for the keepalive ping.
 * @params url A URL or a Angular HTTP requesct configuration object.
 */
http(url: string | ng.IRequestConfig);
/**
 * Sets the interval for the keepalive ping.
 * @param time Time in seconds for the keepalive ping interval.
 */
setInterval(time: number): void;
```

### $keepalive
```typescript
/**
 * Sets the interval for the keepalive ping.
 * @param time Time in seconds for the keepalive ping interval.
 */
setInterval(time: number): void;
/**
 * Starts pinging the server.
 * @returns A promise that can be used to handle server response.
 */
start(): ng.IPromise<any>;
/**
 * Stops pinging the server.
 */
stop(): void;
/**
 * Performs a keep alive ping to the server based on the given options.
 */
ping(): void;
```

### $idleProvider
```typescript
/**
 * Sets the number of seconds a user can be idle before they are considered timed out.
 * @param seconds The amount of seconds, or 0 to disable.
 */
setTimeoutTime(seconds: number): void;
/**
 * Sets the events that will interrupt the idle timer.
 * @param events An space-separated list of strings containing the event names.
 */
interrupt(events: string): void;
/**
 * Sets the events that will interrupt the idle timer.
 * @param events An array of strings containing the event names.
 */
windowInterrupt(events: string[]): void;
/**
 * Sets the number of seconds a user can be idle.
 * @param seconds The amount of seconds.
 */
setIdleTime(seconds: number): void;
/**
 * Specifies if the idle timer should autoresume.
 * @param autoResume True if it should autoresume.
 */
autoResume(autoResume: boolean): void;
/**
 * Specifies if a keepalive ping should be sent.
 * @param keepalive True if it should trigger pings.
 */
keepalive(keepalive: boolean): void;
```

### $idle
```typescript
/**
 * Sets the number of seconds a user can be idle before they are considered timed out.
 * @param seconds The amount of seconds, or 0 to disable.
 */
setTimeoutTime(seconds: number): void;
/**
 * Sets the number of seconds a user can be idle.
 * @param seconds The amount of seconds.
 */
setIdleTime(seconds: number): void;
/**
 * Retrieves the amount of time needed to be idle.
 * @returns A number representing the seconds needed for a user to be idle.
 */
getIdle(): number;
/**
 * Retrieves the amount of time needed to be timed out after being idle.
 * @returns A number representing the seconds needed for a user to be idle.
 */
getTimeout(): number;
/**
 * Checks if the expiration time has been reached.
 * @returns True if it has expired.
 */
isExpired(): boolean;
/**
 * Checks if the timers are running.
 * @returns True if timers are running.
 */
isRunning(): boolean;
/**
 * Checks if the user is becoming idle.
 * @returns True if it's idle.
 */
isIdling(): boolean;
/**
 * Starts watching for inactivity.
 * @param expiry Indicates if the watcher should expire after idle + timeout time.
 */
watch(noExpiryUpdate: boolean): void;
/**
 * Stops watching for inactivity. Also stops the keepalive ping.
 */
unwatch(): void;
/**
 * Resets the idle timers.
 * @param anotherTab Indicates if the interruption was made from another tab.
 */
interrupt(anotherTab?: boolean);
```

## Events
### $userIdle
This event fires when the user appears to have gone idle.

### $userBack
This event fires when the user has return from idle, and before being considered timed out.

### $userIdleWarning
This event fires just after the $userIdle event, and includes a countdown until the user is considered timed out.

### $userTimeout
This event fires when the user has timed out, meaning that both idle time + timeout time has passed without any activity.

This is the event you should use to log the user off the application, for example.

### $keepalive
This event fires when a keepalive ping has been sent.

### $keepaliveResponse
This event fires after the server responds to the keepalive ping. This can contain any data you want.

### Usage
```javascript
$scope.$on('<eventName>', function() {
    // Your logic here.
});
```