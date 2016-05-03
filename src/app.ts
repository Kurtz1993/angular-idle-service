/// <reference path="KeepAlive/keepAlive.ts" />
/// <reference path="IdleStorage/idleStorage.ts" />
/// <reference path="Idle/idle.ts" />

import {IdleStorage} from './IdleStorage/idleStorage';
import {KeepaliveProvider} from './KeepAlive/keepAlive';
import {Idle} from './Idle/idle';

export let idleModule = angular
  .module('Idle', [])
  .service('IdleLocalStorage', IdleStorage)
  .provider('Keepalive', KeepaliveProvider)
  .provider('Idle', Idle);