import {IdleStorage} from './IdleStorage/idleStorage';
import {KeepaliveProvider} from './KeepAlive/keepAlive';
import {Idle} from './Idle/idle';

export let idleModule = angular
  .module('$idle', [])
  .service('$idleLocalStorage', IdleStorage)
  .provider('$keepalive', KeepaliveProvider)
  .provider('$idle', Idle);