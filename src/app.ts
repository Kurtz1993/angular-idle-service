/// <reference path="KeepAlive/keepAlive.ts" />
/// <reference path="IdleStorage/idleStorage.ts" />
/// <reference path="Idle/idle.ts" />
module IdlePackage {
  export let idleModule = angular
    .module("$idle", [])
    .service("$idleLocalStorage", Modules.IdleStorage)
    .provider("$keepalive", Modules.KeepAliveProvider)
    .provider("$idle", Modules.Idle);
}
