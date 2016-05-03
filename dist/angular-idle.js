var Idle;
(function (Idle) {
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
                this.rootScope.$broadcast('Keepalive');
                if (angular.isObject(this.options.http)) {
                    this.$http(this.options.http)
                        .success(this.handleKeepaliveResponse.bind(this))
                        .error(this.handleKeepaliveResponse.bind(this));
                }
            };
            KeepaliveProvider.prototype.handleKeepaliveResponse = function (data, status) {
                this.rootScope.$broadcast('KeepaliveResponse', {
                    data: data,
                    status: status
                });
            };
            return KeepaliveProvider;
        }());
        Modules.KeepaliveProvider = KeepaliveProvider;
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
var Idle;
(function (Idle) {
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
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
/// <reference path="KeepAlive/keepAlive.ts" />
/// <reference path="IdleStorage/idleStorage.ts" />
var Idle;
(function (Idle) {
    Idle.idleModule = angular
        .module('Idle', [])
        .service('IdleLocalStorage', Idle.Modules.IdleStorage)
        .provider('Keepalive', Idle.Modules.KeepaliveProvider);
})(Idle || (Idle = {}));
