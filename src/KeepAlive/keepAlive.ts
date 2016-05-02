module Idle.Modules {
    export class KeepAliveProvider {
        static $inject = ['$rootScope', '$log', '$interval', '$http'];
        public options: IKeepAliveOptions;
        private rootScope: ng.IRootScopeService;
        private log: ng.ILogService;
        private interval: ng.IIntervalService;
        private http: ng.IHttpService;
        private state: { ping: ng.IPromise<any> };

        constructor($rootScope: ng.IRootScopeService, $log: ng.ILogService, $interval: ng.IIntervalService, $http: ng.IHttpService) {
            this.options = {
                http: null,
                interval: 10 * 60
            };
        }

        /**
         * Sets the interval for the keepalive ping.
         * @param time Time in seconds for the keepalive ping interval.
         */
        public setInterval(time: number): void {
            if (isNaN(time) || time <= 0) {
                throw new Error('Interval must be greater than 0 and expressed in seconds.');
            }
            this.options.interval = time;
        }
        
        /**
         * Starts pinging the server.
         * @returns A promise that can be used to handle server response.
         */
        public start(): ng.IPromise<any> {
            this.interval.cancel(this.state.ping);
            this.state.ping = this.interval(this.ping.bind(this), this.options.interval * 1000);
            return this.state.ping;
        }
        
        /**
         * Stops pinging the server.
         */
        public stop(): void {
            this.interval.cancel(this.state.ping);
        }
        
        /**
         * Performs a keep alive ping to the server based on the given options.
         */
        public ping(): void {
            this.rootScope.$broadcast('Keepalive');
            if (angular.isObject(this.options.http)) {
                this.http(this.options.http)
                    .success(this.handlePingResponse.bind(this))
                    .error(this.handlePingResponse.bind(this))
            }
        }
        
        /**
         * Emits an event with the data and status from the ping.
         * @param data Data from the server response.
         * @param status Status of the server response.
         */
        private handlePingResponse(data: any, status: any): void {
            this.rootScope.$broadcast('KeepaliveResponse', data, status);
        }
    }
}