module IdlePackage.Modules {
  export class KeepaliveProvider implements ng.IServiceProvider, IKeepaliveProvider {
    private options: IKeepaliveOptions;
    private state: { ping: ng.IPromise<any> };
    private rootScope: ng.IRootScopeService;
    private interval: ng.IIntervalService;
    private $http: ng.IHttpService;

    constructor() {
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
    http(url: string | ng.IRequestConfig) {
      let httpObj: ng.IRequestConfig = {
        url: '',
        method: ''
      };
      if (!url) {
        throw new Error('Argument must contain a URL as a string or an object containing the Angular HTTP request configuration.');
      }
      if (angular.isString(url)) {
        httpObj.url = url as string;
        httpObj.method = 'GET';
      } else {
        httpObj = url as ng.IRequestConfig;
      }

      httpObj.cache = false;
      this.options.http = httpObj;
    }

    $get($rootScope: ng.IRootScopeService, $interval: ng.IIntervalService, $http: ng.IHttpService): IKeepaliveService {
      this.rootScope = $rootScope;
      this.interval = $interval;
      this.$http = $http;

      return {
        setInterval: this.setInterval.bind(this),
        start: this.start.bind(this),
        stop: this.stop.bind(this),
        ping: this.ping.bind(this)
      };
    }

    /**
     * Sets the interval for the keepalive ping.
     * @param time Time in seconds for the keepalive ping interval.
     */
    setInterval(time: number): void {
      if (isNaN(time) || time <= 0) {
        throw new Error('Interval must be a positive integer number.');
      }
      this.options.interval = time;
    }

    private start(): ng.IPromise<any> {
      this.interval.cancel(this.state.ping);
      this.state.ping = this.interval(this.ping.bind(this), this.options.interval * 1000);
      return this.state.ping;
    }

    private stop(): void {
      this.interval.cancel(this.state.ping);
    }

    private ping(): void {
      this.rootScope.$broadcast('$keepalive');
      if (angular.isObject(this.options.http)) {
        this.$http(this.options.http)
          .success(this.handleKeepaliveResponse.bind(this))
          .error(this.handleKeepaliveResponse.bind(this));
      }
    }

    private handleKeepaliveResponse(data: any, status: any): void {
      this.rootScope.$broadcast('$keepaliveResponse', {
        data: data,
        status: status
      });
    }
  }
}