import * as angular from "angular";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";
import "rxjs/add/operator/throttleTime";
import "rxjs/add/operator/do";
import "rxjs/add/operator/takeUntil";
import "rxjs/add/operator/repeat";
import "rxjs/add/observable/fromEvent";
import "rxjs/add/observable/merge";
import "rxjs/add/observable/interval";
import "rxjs/add/observable/timer";

import { IdleProviderOptions, IdleState } from "../types/idle.types";

export class IdleProvider implements ng.IServiceProvider {
  private options: IdleProviderOptions;
  private idleState: IdleState;
  private rootScope: ng.IRootScopeService;
  private window: ng.IWindowService;
  private userIsActive$: Observable<{}>;
  private eventsSuscription: Subscription;
  private timer: Subscription;
  private timeoutCountdown: Subscription;
  private idle: Subscription;

  constructor() {
    this.options = {
      idle: 20 * 60,
      timeout: 30,
      autoResume: "idle",
      listenFor: "keydown mousedown touchstart touchmove scroll",
    };

    this.idleState = {
      idle: null,
      timeout: null,
      userIdleTime: 0,
      idling: false,
      running: false,
      countdown: null,
    };

    this.$get.$inject = ["$rootScope", "$window"];
  }

  $get($rootScope: ng.IRootScopeService, $window: ng.IWindowService) {
    this.rootScope = $rootScope;
    this.window = $window;

    this.buildInterruptObservable(this.options.listenFor);

    return {
      watch: this.watch.bind(this),
      setIdleTime: this.setIdleTime.bind(this),
      setTimeoutTime: this.setTimeoutTime.bind(this),
    };
  }

  /**
   * Starts watching the window for inactivity.
   */
  watch() {
    this.idleState.userIdleTime = 0;
    this.eventsSuscription = this.userIsActive$.subscribe((ev: Event) => this.interruptTimers());

    this.idleState.running = true;

    if (this.idleState.idling) {
      this.toggleState();
    }

    if (!this.timer) {
      this.timer = Observable.interval(1000)
        .takeUntil(this.userIsActive$)
        .repeat()
        .subscribe(() => this.idleState.userIdleTime++);
    }

    this.idle = Observable.timer(this.options.idle * 1000)
      .subscribe(() => this.toggleState());
  }

  /**
   * Sets the number of seconds of inactivity that the user needs to be idle.
   * @param seconds Time in seconds.
   */
  setIdleTime(seconds: number): void {
    if (angular.isNumber(seconds) && seconds >= 0) {
      this.options.idle = seconds;
    } else {
      throw new Error("The idle time must be a positive number.");
    }
  }

  /**
   * Sets the number of seconds the user has to become active again before timing out.
   * @param seconds Time in seconds.
   */
  setTimeoutTime(seconds: number): void {
    if (angular.isNumber(seconds) && seconds >= 0) {
      this.options.timeout = seconds;
    } else {
      throw new Error("The timeout time must be a positive number.");
    }
  }

  /**
   * Interrupts the timers, indicating that the user is active again.
   * Emits the $userActive event.
   */
  private interruptTimers(): void {
    if (!this.idleState.running) return;

    if (
      this.options.autoResume === "idle" ||
      (this.options.autoResume === "notIdle" && !this.idleState.idling)
    ) {
      this.rootScope.$broadcast("$userActive", this.idleState.userIdleTime);
      this.watch();
    }
  }

  /**
   * Sends a $userIdle or $userBacck event depending on the user state.
   */
  private toggleState(): void {
    this.idleState.idling = !this.idleState.idling;
    let name = this.idleState.idling ? "$userIdle" : "$userBack";
    if (this.idleState.idling) {
      if (this.options.timeout) {
        let countdown = this.options.timeout;
        this.timeoutCountdown = Observable.interval(1000)
          .do(() => this.rootScope.$broadcast("$userIdleWarning", countdown))
          .takeUntil(this.userIsActive$)
          .subscribe(() => {
            countdown--;
            if (countdown <= 0) {
              this.timeout();
              console.log("Timed out!");
            }
          });
      }
    } else {
    }

    this.rootScope.$broadcast(name);
  }

  private timeout(): void {
    this.idleState.idling = false;
    this.idleState.running = false;
    this.idleState.userIdleTime = 0;

    this.eventsSuscription.unsubscribe();
    this.timeoutCountdown.unsubscribe();
    this.idle.unsubscribe();
    this.timer.unsubscribe();

    this.rootScope.$broadcast("$userTimeout");
  }

  /**
   * Builds an observable that listens to the given DOM events.
   * @param events A pace-separated list of events to listen.
   */
  private buildInterruptObservable(events: string): void {
    const htmlElm = document.querySelector("html");
    const observables = events
      .split(" ")
      .map(event => Observable.fromEvent(htmlElm, event).throttleTime(1000));

    this.userIsActive$ = Observable.merge(...observables);
  }
}
