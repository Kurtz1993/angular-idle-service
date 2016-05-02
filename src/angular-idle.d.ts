declare interface IKeepAliveOptions {
    /**
     * The HTTP configuration headers to perform the ping.
     */
    http: ng.IRequestConfig;
    /**
     * Time in seconds for the ping interval.
     */
    interval: number
}