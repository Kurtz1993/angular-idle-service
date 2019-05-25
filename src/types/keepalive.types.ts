export interface KeepaliveProvider {
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

export interface KeepaliveService {
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

export interface KeepaliveOptions {
  /**
   * The HTTP configuration headers to perform the ping.
   */
  http: ng.IRequestConfig;
  /**
   * Time in seconds for the ping interval.
   */
  interval: number;
}
