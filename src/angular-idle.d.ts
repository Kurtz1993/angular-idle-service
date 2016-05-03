declare interface IKeepaliveProvider {
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
}

declare interface IKeepaliveService {
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
}

declare interface IKeepaliveOptions {
  /**
   * The HTTP configuration headers to perform the ping.
   */
  http: ng.IRequestConfig;
  /**
   * Time in seconds for the ping interval.
   */
  interval: number;
}

declare interface IIdleProvider {
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
}

declare interface IIdleService {
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
}

declare interface IIdleState {
  /**
   * A promise to resolve when the user becomes idle.
   */
  idle: ng.IPromise<any>;
  /**
   * A promise to resolve when the user has timed out.
   */
  timeout: ng.IPromise<any>;
  /**
   * Indicates if the user is idling.
   */
  idling: boolean;
  /**
   * Indicates if the service is running.
   */
  running: boolean;
  /**
   * Countdown until the user times out.
   */
  countdown: number;
}

declare interface IIdleProviderOptions {
  /**
   * Indicates the time in seconds that needs to pass before considering the user idlde.
   */
  idle: number;
  /**
   * Indicates the time in seconds after the user is idle, to consider a timeout.
   */
  timeout: number;
  /**
   * Lets events automatically resume (unsets idle state/resets warning).
   */
  autoResume: string;
  /**
   * An space-separated list of strings containing the name of events that will reset idle timers.
   */
  interrupt: string;
  /**
   * An array of strings containing the name of events that will reset idle timers.
   */
  windowInterrupt: string[];
  /**
   * Indicates if a keepalive ping should be triggered.
   */
  keepalive: boolean;
}

declare interface IIdleStorage {
  /**
   * Sets an item to the local storage.
   * @param key The key for the item.
   * @param value The value of the item.
   */
  set(key: string, value: any): void;
  /**
   * Gets the specified item.
   * @param key The key for the item to retrieve.
   * @returns The value for the key in JSON format.
   */
  get(key: string): any;
  /**
   * Removes the specified item.
   * @param key The key for the item to remove.
   */
  remove(key: string): void;
}