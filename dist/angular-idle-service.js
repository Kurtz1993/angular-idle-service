var IdlePackage;
(function (IdlePackage) {
    var Modules;
    (function (Modules) {
        var KeepaliveProvider = (function () {
            function KeepaliveProvider() {
                this.$get.$inject = ['$rootScope', '$interval', '$http'];
                this.options = {
                    http: null,
                    interval: 10 * 60
                };
                this.state = {
                    ping: null
                };
            }
            /**
             * Sets the http configurations for the keepalive ping.
             * @params url A URL or a Angular HTTP requesct configuration object.
             */
            KeepaliveProvider.prototype.http = function (url) {
                var httpObj = {
                    url: '',
                    method: ''
                };
                if (!url) {
                    throw new Error('Argument must contain a URL as a string or an object containing the Angular HTTP request configuration.');
                }
                if (angular.isString(url)) {
                    httpObj.url = url;
                    httpObj.method = 'GET';
                }
                else {
                    httpObj = url;
                }
                httpObj.cache = false;
                this.options.http = httpObj;
            };
            KeepaliveProvider.prototype.$get = function ($rootScope, $interval, $http) {
                this.rootScope = $rootScope;
                this.interval = $interval;
                this.$http = $http;
                return {
                    setInterval: this.setInterval.bind(this),
                    start: this.start.bind(this),
                    stop: this.stop.bind(this),
                    ping: this.ping.bind(this)
                };
            };
            /**
             * Sets the interval for the keepalive ping.
             * @param time Time in seconds for the keepalive ping interval.
             */
            KeepaliveProvider.prototype.setInterval = function (time) {
                if (isNaN(time) || time <= 0) {
                    throw new Error('Interval must be a positive integer number.');
                }
                this.options.interval = time;
            };
            KeepaliveProvider.prototype.start = function () {
                this.interval.cancel(this.state.ping);
                this.state.ping = this.interval(this.ping.bind(this), this.options.interval * 1000);
                return this.state.ping;
            };
            KeepaliveProvider.prototype.stop = function () {
                this.interval.cancel(this.state.ping);
            };
            KeepaliveProvider.prototype.ping = function () {
                this.rootScope.$broadcast('$keepalive');
                if (angular.isObject(this.options.http)) {
                    this.$http(this.options.http)
                        .success(this.handleKeepaliveResponse.bind(this))
                        .error(this.handleKeepaliveResponse.bind(this));
                }
            };
            KeepaliveProvider.prototype.handleKeepaliveResponse = function (data, status) {
                this.rootScope.$broadcast('$keepaliveResponse', {
                    data: data,
                    status: status
                });
            };
            return KeepaliveProvider;
        }());
        Modules.KeepaliveProvider = KeepaliveProvider;
    })(Modules = IdlePackage.Modules || (IdlePackage.Modules = {}));
})(IdlePackage || (IdlePackage = {}));
var IdlePackage;
(function (IdlePackage) {
    var Modules;
    (function (Modules) {
        var IdleStorage = (function () {
            function IdleStorage($window) {
                // This is done because Safari issues with the localStorage when accessing on private tab.
                try {
                    var s = $window.localStorage;
                    s.setItem('idleStorage', '');
                    s.removeItem('idleStorage');
                    this.storage = s;
                }
                catch (err) {
                    this.storage = new AlternativeStorage();
                }
            }
            IdleStorage.prototype.set = function (key, value) {
                this.storage.setItem("idle." + key, angular.toJson(value));
            };
            IdleStorage.prototype.get = function (key) {
                return angular.fromJson(this.storage.getItem("idle." + key));
            };
            IdleStorage.prototype.remove = function (key) {
                this.storage.removeItem("idle." + key);
            };
            IdleStorage.$inject = ['$window'];
            return IdleStorage;
        }());
        Modules.IdleStorage = IdleStorage;
        var AlternativeStorage = (function () {
            function AlternativeStorage() {
            }
            /**
             * Sets a value into the storage with the given key.
             * @param key The key for the item.
             * @param value The value of the item.
             */
            AlternativeStorage.prototype.setItem = function (key, value) {
                this.storage[key] = value;
            };
            /**
             * Gets the specified item by key.
             * @param key The key of the item.
             * @returns The item or null if it doesn't exist.
             */
            AlternativeStorage.prototype.getItem = function (key) {
                if (typeof this.storage[key] !== 'undefined') {
                    return this.storage[key];
                }
                return null;
            };
            /**
             * Removes the specified item.
             * @param key The key of the item.
             */
            AlternativeStorage.prototype.removeItem = function (key) {
                this.storage[key] = undefined;
            };
            /**
             * Clears the whole storage object.
             */
            AlternativeStorage.prototype.clear = function () {
                this.storage = {};
            };
            AlternativeStorage.prototype.key = function (index) {
                return this.storage[index];
            };
            return AlternativeStorage;
        }());
    })(Modules = IdlePackage.Modules || (IdlePackage.Modules = {}));
})(IdlePackage || (IdlePackage = {}));
var IdlePackage;
(function (IdlePackage) {
    var Modules;
    (function (Modules) {
        var Idle = (function () {
            function Idle() {
                this.options = {
                    idle: 20 * 60,
                    timeout: 30,
                    autoResume: 'idle',
                    interrupt: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll',
                    windowInterrupt: null,
                    keepalive: false // By default the module won't send keepalive pings.
                };
                this.state = {
                    idle: null,
                    timeout: null,
                    idling: false,
                    running: false,
                    countdown: null
                };
                this.$get.$inject = ['$interval', '$rootScope', '$document', '$window', '$keepalive', '$idleLocalStorage'];
            }
            Idle.prototype.$get = function ($interval, $rootScope, $document, $window, $keepalive, $idleLocalStorage) {
                var _this = this;
                this.interval = $interval;
                this.rootScope = $rootScope;
                this.document = $document;
                this.window = $window;
                this.keepaliveService = $keepalive;
                this.storage = $idleLocalStorage;
                this.id = new Date().getTime();
                var lastmove = new LastMove();
                this.document.find('html').on(this.options.interrupt, function (event) {
                    if (event.type === 'mousemove' && event.originalEvent && event.originalEvent['movementX'] === 0 && event.originalEvent['movementY'] === 0) {
                        return;
                    }
                    if (event.type !== 'mousemove' || lastmove.hasMoved(event)) {
                        _this.interruptTimers();
                    }
                });
                if (this.options.windowInterrupt) {
                    var fn_1 = function () { return _this.interruptTimers(); };
                    this.options.windowInterrupt.forEach(function (evt) {
                        _this.window.addEventListener(evt, fn_1, false);
                    });
                }
                this.window.addEventListener('storage', this.wrap.bind(this), false);
                return {
                    setTimeoutTime: this.setTimeoutTime.bind(this),
                    setIdleTime: this.setIdleTime.bind(this),
                    getIdle: function () { return _this.options.idle; },
                    getTimeout: function () { return _this.options.timeout; },
                    isExpired: this.isExpired.bind(this),
                    isRunning: function () { return _this.state.running; },
                    isIdling: function () { return _this.state.idling; },
                    watch: this.watch.bind(this),
                    unwatch: this.unwatch.bind(this),
                    interrupt: this.interruptTimers.bind(this)
                };
            };
            Idle.prototype.setTimeoutTime = function (seconds) {
                if (angular.isNumber(seconds) && seconds >= 0) {
                    this.options.timeout = seconds;
                }
                else {
                    throw new Error('Timeout time must be a positive integer in seconds or 0 to disable it.');
                }
            };
            Idle.prototype.interrupt = function (events) {
                this.options.interrupt = events;
            };
            Idle.prototype.windowInterrupt = function (events) {
                this.options.windowInterrupt = events;
            };
            Idle.prototype.setIdleTime = function (seconds) {
                if (angular.isNumber(seconds) && seconds >= 0) {
                    this.options.idle = seconds;
                }
                else {
                    throw new Error('Idle time must be a positive integer in seconds or 0 to disable it.');
                }
            };
            Idle.prototype.autoResume = function (autoResume) {
                this.options.autoResume = autoResume ? 'idle' : 'off';
            };
            Idle.prototype.keepalive = function (keepalive) {
                this.options.keepalive = keepalive === true;
            };
            /**
             * Starts sending keepalive pings.
             */
            Idle.prototype.startKeepalive = function () {
                if (!this.options.keepalive) {
                    return;
                }
                if (this.state.running) {
                    this.keepaliveService.ping();
                }
                this.keepaliveService.start();
            };
            /**
             * Stops sending keepalive pings.
             */
            Idle.prototype.stopKeepalive = function () {
                if (!this.options.keepalive) {
                    return;
                }
                this.keepaliveService.stop();
            };
            /**
             * Perform a countdown starting from the specified timeout time.
             */
            Idle.prototype.countdown = function () {
                if (!this.state.idling) {
                    return;
                }
                if (this.state.countdown <= 0) {
                    this.timeout();
                    return;
                }
                this.rootScope.$broadcast('$userIdleWarning', this.state.countdown);
                this.state.countdown--;
            };
            /**
             * Sends an IdleTimeout event and stops all timers and keepalive pings.
             */
            Idle.prototype.timeout = function () {
                this.stopKeepalive();
                this.interval.cancel(this.state.idle);
                this.interval.cancel(this.state.timeout);
                this.state.idling = true;
                this.state.running = false;
                this.state.countdown = 0;
                this.rootScope.$broadcast('$userTimeout');
            };
            /**
             * Sends an IdleStart or IdleEnd event depending on the user state.
             */
            Idle.prototype.toggleState = function () {
                this.state.idling = !this.state.idling;
                var name = this.state.idling ? '$userIdle' : '$userBack';
                if (this.state.idling) {
                    this.rootScope.$broadcast(name);
                    this.stopKeepalive();
                    if (this.options.timeout) {
                        this.state.countdown = this.options.timeout;
                        this.countdown();
                        this.state.timeout = this.interval(this.countdown.bind(this), 1000, this.options.timeout, false);
                    }
                }
                else {
                    this.startKeepalive();
                    this.rootScope.$broadcast(name);
                }
                this.interval.cancel(this.state.idle);
            };
            /**
             * Changes the specified option, resetting all the timers.
             * @param timeoutFn Indicates if the function is for timeout value, if false will change idle value.
             * @param value The new time for timeout or idle in seconds.
             */
            Idle.prototype.changeOption = function (timeoutFn, value) {
                this.unwatch();
                if (timeoutFn) {
                    this.setTimeoutTime(value);
                }
                else {
                    this.setIdleTime(value);
                }
                if (this.state.running) {
                    this.watch();
                }
            };
            Idle.prototype.wrap = function (event) {
                if (event.key === 'idle.expiry' && event.newValue && event.newValue !== event.oldValue) {
                    var val = angular.fromJson(event.newValue);
                    if (val.id === this.id) {
                        return;
                    }
                    this.interruptTimers(true);
                }
            };
            /**
             * Gets the expiration date of the timers, if any.
             * @returns The expiration date.
             */
            Idle.prototype.getExpiry = function () {
                var obj = this.storage.get('expiry');
                return obj && obj.time ? new Date(obj.time) : null;
            };
            /**
             * Sets an expiration date for the timers.
             * @param date The expiration date.
             */
            Idle.prototype.setExpiry = function (date) {
                if (!date) {
                    this.storage.remove('expiry');
                }
                else {
                    this.storage.set('expiry', { id: this.id, time: date });
                }
            };
            Idle.prototype.interruptTimers = function (anotherTab) {
                if (!this.state.running) {
                    return;
                }
                if (this.options.timeout && this.isExpired()) {
                    this.timeout();
                    return;
                }
                if (anotherTab || this.options.autoResume === 'idle' || (this.options.autoResume === 'notIdle' && !this.state.idling)) {
                    this.watch(anotherTab);
                }
            };
            Idle.prototype.isExpired = function () {
                var expiry = this.getExpiry();
                return expiry !== null && expiry <= new Date();
            };
            Idle.prototype.watch = function (noExpiryUpdate) {
                this.interval.cancel(this.state.idle);
                this.interval.cancel(this.state.timeout);
                var timeout = !this.options.timeout ? 0 : this.options.timeout;
                if (noExpiryUpdate) {
                    this.setExpiry(new Date(new Date().getTime() + ((this.options.idle + timeout) * 1000)));
                }
                if (this.state.idling) {
                    this.toggleState();
                }
                else if (!this.state.running) {
                    this.startKeepalive();
                }
                this.state.running = true;
                this.state.idle = this.interval(this.toggleState.bind(this), this.options.idle * 1000, 0, false);
            };
            Idle.prototype.unwatch = function () {
                this.interval.cancel(this.state.idle);
                this.interval.cancel(this.state.timeout);
                this.state.idling = false;
                this.state.running = false;
                this.setExpiry(null);
                this.stopKeepalive();
            };
            return Idle;
        }());
        Modules.Idle = Idle; // End of class
        var LastMove = (function () {
            function LastMove() {
                this.clientX = null;
                this.clientY = null;
            }
            /**
             * Swaps the last movement coordinates with the new ones.
             * @event The mouse event containing the new coordinates.
             * @returns The swapped coordinates.
             */
            LastMove.prototype.swap = function (event) {
                var last = {
                    clientX: this.clientX,
                    clientY: this.clientY
                };
                this.clientX = event.clientX;
                this.clientY = event.clientY;
                return last;
            };
            /**
             * Indicates if the user has moved.
             * @param event The mouse event containing the movement information.
             * @returns True if the user has moved.
             */
            LastMove.prototype.hasMoved = function (event) {
                var last = this.swap(event);
                if (this.clientX === null || event['movementX'] || event['movementY']) {
                    return true;
                }
                else if (last.clientX != event.clientX || last.clientY != event.clientY) {
                    return true;
                }
                else {
                    return false;
                }
            };
            return LastMove;
        }());
    })(Modules = IdlePackage.Modules || (IdlePackage.Modules = {}));
})(IdlePackage || (IdlePackage = {}));
/// <reference path="KeepAlive/keepAlive.ts" />
/// <reference path="IdleStorage/idleStorage.ts" />
/// <reference path="Idle/idle.ts" />
var IdlePackage;
(function (IdlePackage) {
    IdlePackage.idleModule = angular
        .module('$idle', [])
        .service('$idleLocalStorage', IdlePackage.Modules.IdleStorage)
        .provider('$keepalive', IdlePackage.Modules.KeepaliveProvider)
        .provider('$idle', IdlePackage.Modules.Idle);
})(IdlePackage || (IdlePackage = {}));
//# sourceMappingURL=angular-idle-service.js.map