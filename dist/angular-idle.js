var Idle;
(function (Idle) {
    var Modules;
    (function (Modules) {
        var KeepAliveProvider = (function () {
            function KeepAliveProvider($rootScope, $log, $interval, $http) {
                this.options = {
                    http: null,
                    interval: 10 * 60
                };
            }
            KeepAliveProvider.prototype.setInterval = function (time) {
                if (isNaN(time) || time <= 0) {
                    throw new Error('Interval must be greater than 0 and expressed in seconds.');
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
                    this.http(this.options.http)
                        .success(this.handlePingResponse.bind(this))
                        .error(this.handlePingResponse.bind(this));
                }
            };
            KeepAliveProvider.prototype.handlePingResponse = function (data, status) {
                this.rootScope.$broadcast('KeepaliveResponse', data, status);
            };
            KeepAliveProvider.$inject = ['$rootScope', '$log', '$interval', '$http'];
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
            AlternativeStorage.prototype.setItem = function (key, value) {
                this.storageMap[key] = value;
            };
            AlternativeStorage.prototype.getItem = function (key) {
                if (typeof this.storageMap[key] !== 'undefined') {
                    return this.storageMap[key];
                }
                return null;
            };
            AlternativeStorage.prototype.removeItem = function (key) {
                this.storageMap[key] = undefined;
            };
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
            IdleLocalStorage.prototype.set = function (key, value) {
                this.storage.setItem("idle." + key, angular.toJson(value));
            };
            IdleLocalStorage.prototype.get = function (key) {
                return angular.fromJson(this.storage.getItem("idle." + key));
            };
            IdleLocalStorage.prototype.remove = function (key) {
                this.storage.removeItem("idle." + key);
            };
            IdleLocalStorage.prototype._wrapped = function () {
                return this.storage;
            };
            IdleLocalStorage.$inject = ['$window'];
            return IdleLocalStorage;
        }());
        Modules.IdleLocalStorage = IdleLocalStorage;
    })(Modules = Idle.Modules || (Idle.Modules = {}));
})(Idle || (Idle = {}));
//# sourceMappingURL=angular-idle.js.map