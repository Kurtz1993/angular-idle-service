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
  interval: number
}

declare interface IIdleStorage {
  /**
   * Sets an item to the local storage.
   * @param key The key for the item.
   * @param value The value of the item.
   */
  set(key: string, value: string): void;
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