module IdlePackage.Modules {
  export class Idle implements ng.IServiceProvider, IIdleProvider {
    private options: IIdleProviderOptions;
    private state: IIdleState;
    private interval: ng.IIntervalService;
    private rootScope: ng.IRootScopeService;
    private document: ng.IDocumentService;
    private window: ng.IWindowService;
    private keepaliveService: IKeepaliveService;
    private storage: IIdleStorage;
    private id: number;

    constructor() {
      this.options = {
        idle: 20 * 60, // Default idle time is 20 minutes.
        timeout: 30,   // Default timeout time is 30 seconds.
        autoResume: 'idle',
        interrupt: 'mousemove keydown DOMMouseScroll mousewheel mousedown touchstart touchmove scroll',
        windowInterrupt: null,
        keepalive: false  // By default the module won't send keepalive pings.
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

    $get($interval: ng.IIntervalService, $rootScope: ng.IRootScopeService, $document: ng.IDocumentService,
      $window: ng.IWindowService, $keepalive: IKeepaliveService, $idleLocalStorage: IIdleStorage): IIdleService {
      this.interval = $interval;
      this.rootScope = $rootScope;
      this.document = $document;
      this.window = $window;
      this.keepaliveService = $keepalive;
      this.storage = $idleLocalStorage;
      this.id = new Date().getTime();
      let lastmove = new LastMove();

      this.document.find('html').on(this.options.interrupt, (event) => {
        if (event.type === 'mousemove' && event.originalEvent && event.originalEvent['movementX'] === 0 && event.originalEvent['movementY'] === 0) {
          return;
        }

        if (event.type !== 'mousemove' || lastmove.hasMoved(event)) {
          this.interruptTimers();
        }
      });

      if (this.options.windowInterrupt) {
        let fn = () => this.interruptTimers();
        this.options.windowInterrupt.forEach((evt) => {
          this.window.addEventListener(evt, fn, false);
        });
      }

      this.window.addEventListener('storage', this.wrap.bind(this), false);

      return {
        setTimeoutTime: this.setTimeoutTime.bind(this),
        setIdleTime: this.setIdleTime.bind(this),
        getIdle: () => this.options.idle,
        getTimeout: () => this.options.timeout,
        isExpired: this.isExpired.bind(this),
        isRunning: () => this.state.running,
        isIdling: () => this.state.idling,
        watch: this.watch.bind(this),
        unwatch: this.unwatch.bind(this),
        interrupt: this.interruptTimers.bind(this)
      };
    }

    setTimeoutTime(seconds: number): void {
      if (angular.isNumber(seconds) && seconds >= 0) {
        this.options.timeout = seconds;
      } else {
        throw new Error('Timeout time must be a positive integer in seconds or 0 to disable it.');
      }
    }

    interrupt(events: string): void {
      this.options.interrupt = events;
    }

    windowInterrupt(events: string[]): void {
      this.options.windowInterrupt = events;
    }

    setIdleTime(seconds: number): void {
      if (angular.isNumber(seconds) && seconds >= 0) {
        this.options.idle = seconds;
      } else {
        throw new Error('Idle time must be a positive integer in seconds or 0 to disable it.');
      }
    }

    autoResume(autoResume: boolean): void {
      this.options.autoResume = autoResume ? 'idle' : 'off';
    }

    keepalive(keepalive: boolean): void {
      this.options.keepalive = keepalive === true;
    }

    /**
     * Starts sending keepalive pings.
     */
    private startKeepalive(): void {
      if (!this.options.keepalive) {
        return;
      }
      if (this.state.running) {
        this.keepaliveService.ping();
      }

      this.keepaliveService.start();
    }

    /**
     * Stops sending keepalive pings.
     */
    private stopKeepalive(): void {
      if (!this.options.keepalive) {
        return;
      }

      this.keepaliveService.stop();
    }

    /**
     * Perform a countdown starting from the specified timeout time.
     */
    private countdown(): void {
      if (!this.state.idling) {
        return;
      }

      if (this.state.countdown <= 0) {
        this.timeout();
        return;
      }

      this.rootScope.$broadcast('$userIdleWarning', this.state.countdown);
      this.state.countdown--;
    }

    /**
     * Sends an IdleTimeout event and stops all timers and keepalive pings.
     */
    private timeout(): void {
      this.stopKeepalive();
      this.interval.cancel(this.state.idle);
      this.interval.cancel(this.state.timeout);

      this.state.idling = true;
      this.state.running = false;
      this.state.countdown = 0;

      this.rootScope.$broadcast('$userTimeout');
    }

    /**
     * Sends an IdleStart or IdleEnd event depending on the user state.
     */
    private toggleState(): void {
      this.state.idling = !this.state.idling;
      let name = this.state.idling ? '$userIdle' : '$userBack';
      if (this.state.idling) {
        this.rootScope.$broadcast(name);
        this.stopKeepalive();
        if (this.options.timeout) {
          this.state.countdown = this.options.timeout;
          this.countdown();
          this.state.timeout = this.interval(this.countdown.bind(this), 1000, this.options.timeout, false);
        }
      } else {
        this.startKeepalive();
        this.rootScope.$broadcast(name);
      }

      this.interval.cancel(this.state.idle);
    }

    /**
     * Changes the specified option, resetting all the timers.
     * @param timeoutFn Indicates if the function is for timeout value, if false will change idle value.
     * @param value The new time for timeout or idle in seconds.
     */
    private changeOption(timeoutFn: boolean, value: number): void {
      this.unwatch();
      if (timeoutFn) {
        this.setTimeoutTime(value);
      } else {
        this.setIdleTime(value);
      }

      if (this.state.running) {
        this.watch();
      }
    }

    private wrap(event: any): void {
      if (event.key === 'idle.expiry' && event.newValue && event.newValue !== event.oldValue) {
        let val = angular.fromJson(event.newValue);
        if (val.id === this.id) {
          return;
        }
        this.interruptTimers(true);
      }
    }

    /**
     * Gets the expiration date of the timers, if any.
     * @returns The expiration date.
     */
    private getExpiry(): Date {
      let obj = this.storage.get('expiry');
      return obj && obj.time ? new Date(obj.time) : null;
    }

    /**
     * Sets an expiration date for the timers.
     * @param date The expiration date.
     */
    private setExpiry(date: Date): void {
      if (!date) {
        this.storage.remove('expiry');
      } else {
        this.storage.set('expiry', { id: this.id, time: date });
      }
    }

    private interruptTimers(anotherTab?: boolean): void {
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
    }

    private isExpired(): boolean {
      let expiry = this.getExpiry();
      return expiry !== null && expiry <= new Date();
    }

    private watch(noExpiryUpdate?: boolean): void {
      this.interval.cancel(this.state.idle);
      this.interval.cancel(this.state.timeout);

      let timeout = !this.options.timeout ? 0 : this.options.timeout;
      if (noExpiryUpdate) {
        this.setExpiry(new Date(new Date().getTime() + ((this.options.idle + timeout) * 1000)));
      }

      if (this.state.idling) {
        this.toggleState();
      } else if (!this.state.running) {
        this.startKeepalive();
      }

      this.state.running = true;
      this.state.idle = this.interval(this.toggleState.bind(this), this.options.idle * 1000, 0, false);
    }

    private unwatch(): void {
      this.interval.cancel(this.state.idle);
      this.interval.cancel(this.state.timeout);

      this.state.idling = false;
      this.state.running = false;
      this.setExpiry(null);

      this.stopKeepalive();
    }
  } // End of class

  class LastMove {
    public clientX: number;
    public clientY: number;

    constructor() {
      this.clientX = null;
      this.clientY = null;
    }

    /**
     * Swaps the last movement coordinates with the new ones.
     * @event The mouse event containing the new coordinates.
     * @returns The swapped coordinates.
     */
    swap(event: JQueryEventObject): { clientX: number, clientY: number } {
      let last = {
        clientX: this.clientX,
        clientY: this.clientY
      };

      this.clientX = event.clientX;
      this.clientY = event.clientY;

      return last;
    }

    /**
     * Indicates if the user has moved.
     * @param event The mouse event containing the movement information.
     * @returns True if the user has moved.
     */
    hasMoved(event: JQueryEventObject): boolean {
      let last = this.swap(event);
      if (this.clientX === null || event['movementX'] || event['movementY']) {
        return true;
      } else if (last.clientX != event.clientX || last.clientY != event.clientY) {
        return true
      } else {
        return false;
      }
    }
  }
}