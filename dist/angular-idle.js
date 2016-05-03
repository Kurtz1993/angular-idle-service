var Idle;
(function (Idle) {
    var Modules;
    (function (Modules) {
        var KeepAliveProvider = (function () {
            function KeepAliveProvider() {
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
            KeepAliveProvider.prototype.http = function (url) {
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
            KeepAliveProvider.prototype.$get = function ($rootScope, $interval, $http) {
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
            KeepAliveProvider.prototype.setInterval = function (time) {
                if (isNaN(time) || time <= 0) {
                    throw new Error('Interval must be a positive integer number.');
                }
                this.options.interval = time;
            };
            KeepAliveProvider.prototype.start = function () {
                this.interval.cancel(this.state.ping);
                this.state.ping = this.interval(this.ping.bind(this), this.options.interval * 1000);
                return this.state.ping;
            };
            KeepAliveProvider.prototype.stop = function () {
                this.interval.cancel(this.state.ping);
            };
            KeepAliveProvider.prototype.ping = function () {
                this.rootScope.$broadcast('Keepalive');
                if (angular.isObject(this.options.http)) {
                    this.$http(this.options.http)
                        .success(this.handleKeepaliveResponse.bind(this))
                        .error(this.handleKeepaliveResponse.bind(this));
                }
            };
            KeepAliveProvider.prototype.handleKeepaliveResponse = function (data, status) {
                this.rootScope.$broadcast('KeepaliveResponse', {
                    data: data,
                    status: status
                });
            };
            return KeepAliveProvider;
        }());
        Modules.KeepAliveProvider = KeepAliveProvider;
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
var Idle;
(function (Idle) {
    var Modules;
    (function (Modules) {
        var AlternativeStorage = (function () {
            function AlternativeStorage() {
                this.length = 0;
            }
            /**
             * Stores an item with the specified key/value pair.
             * @param key The key for the item.
             * @param value The value of the item.
             */
            AlternativeStorage.prototype.setItem = function (key, value) {
                this.storageMap[key] = value;
            };
            /**
             * Gets the specified item.
             * @param key The key of the item to retrieve.
             * @returns The specified item or null if not found.
             */
            AlternativeStorage.prototype.getItem = function (key) {
                if (typeof this.storageMap[key] !== 'undefined') {
                    return this.storageMap[key];
                }
                return null;
            };
            /**
             * Removes the specified item.
             * @param key THe key of the item to remove.
             */
            AlternativeStorage.prototype.removeItem = function (key) {
                this.storageMap[key] = undefined;
            };
            /**
             * Clears the entire storage.
             */
            AlternativeStorage.prototype.clear = function () {
                this.storageMap = {};
            };
            AlternativeStorage.prototype.key = function (index) {
                return this.storageMap[index];
            };
            return AlternativeStorage;
        }());
        Modules.AlternativeStorage = AlternativeStorage;
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
var Idle;
(function (Idle) {
    var Modules;
    (function (Modules) {
        var IdleLocalStorage = (function () {
            function IdleLocalStorage($window) {
                try {
                    var s = $window.localStorage;
                    s.setItem('idleStorage', '');
                    s.removeItem('idleStorage');
                    this.storage = s;
                }
                catch (err) {
                    this.storage = new Modules.AlternativeStorage();
                }
            }
            /**
             * Sets an item to the local storage.
             * @param key The key for the item.
             * @param value The value of the item.
             */
            IdleLocalStorage.prototype.set = function (key, value) {
                this.storage.setItem("idle." + key, angular.toJson(value));
            };
            /**
             * Gets the specified item.
             * @param key The key for the item to retrieve.
             * @returns The value for the key in JSON format.
             */
            IdleLocalStorage.prototype.get = function (key) {
                return angular.fromJson(this.storage.getItem("idle." + key));
            };
            /**
             * Removes the specified item.
             * @param key The key for the item to remove.
             */
            IdleLocalStorage.prototype.remove = function (key) {
                this.storage.removeItem("idle." + key);
            };
            /**
             * Gets the whole storage.
             * @returns The LocalStorage object.
             */
            IdleLocalStorage.prototype._wrapped = function () {
                return this.storage;
            };
            IdleLocalStorage.$inject = ['$window'];
            return IdleLocalStorage;
        }());
        Modules.IdleLocalStorage = IdleLocalStorage;
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
/// <reference path="../src/KeepAlive/keepAlive.ts" />
/// <reference path="../src/LocalStorage/alternativeStorage.ts" />
/// <reference path="../src/LocalStorage/localStorage.ts" />
var Idle;
(function (Idle) {
    Idle.idleModule = angular
        .module('Idle', [])
        .provider('Keepalive', Idle.Modules.KeepAliveProvider);
})(Idle || (Idle = {}));
var Idle;
(function (Idle) {
    var Modules;
    (function (Modules) {
        var IdleProvider = (function () {
            function IdleProvider($interval, $rootScope, $document, KeepAlive, IdleLocalStorage, $window) {
                this.options = {
                    idle: 20 * 60,
                    timeout: 30,
                    autoResume: 'idle',
                    interrupt: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll',
                    windowInterrupt: null,
                    keepAlive: true
                };
                this.interval = $interval;
                this.rootScope = $rootScope;
                this.document = $document;
                this.keepAlive = KeepAlive;
                this.storage = IdleLocalStorage;
                this.window = $window;
            }
            /**
             * Sets the number of seconds a user can be idle before they are considered timed out.
             * @param seconds A positive number representing seconds or 0 to disable.
             */
            IdleProvider.prototype.setTimeout = function (seconds) {
                if (seconds === 0) {
                    this.options.timeout = 0;
                }
                else if (angular.isNumber(seconds) && seconds >= 0) {
                    this.options.timeout = seconds;
                }
                else {
                    throw new Error('Timeout must be a positive integer number (in seconds) or 0 to disable timeout.');
                }
            };
            IdleProvider.$inject = ['$interval', '$rootScope', '$document', 'KeepAlive', 'IdleLocalStorage', '$window'];
            return IdleProvider;
        }());
        Modules.IdleProvider = IdleProvider;
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
