/// <reference path="KeepAlive/keepAlive.ts" />
/// <reference path="IdleStorage/idleStorage.ts" />
module Idle {
  export let idleModule = angular
    .module('Idle', [])
    .service('IdleLocalStorage', Modules.IdleStorage)
    .provider('Keepalive', Modules.KeepaliveProvider);
}