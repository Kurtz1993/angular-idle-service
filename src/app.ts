/// <reference path="KeepAlive/keepAlive.ts" />
/// <reference path="IdleStorage/idleStorage.ts" />
/// <reference path="Idle/idle.ts" />
module Idle {
  export let idleModule = angular
    .module('Idle', [])
    .service('IdleLocalStorage', Modules.IdleStorage)
    .provider('Keepalive', Modules.KeepaliveProvider)
    .provider('Idle', Modules.Idle);
}