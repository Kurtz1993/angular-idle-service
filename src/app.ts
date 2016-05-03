/// <reference path="KeepAlive/keepAlive.ts" />
module Idle {
  export let idleModule = angular
    .module('Idle', [])
    .provider('Keepalive', Modules.KeepAliveProvider);
}