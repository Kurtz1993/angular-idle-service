import * as angular from "angular";
import { KeepAliveProvider } from "./providers/keep-alive.provider";
import { IdleStorage } from "./storage/idle-storage";
import { Idle } from "./providers/idle.provider";

export const idleModule = angular
  .module("$idle", [])
  .service("$idleLocalStorage", IdleStorage)
  .provider("$keepalive", KeepAliveProvider)
  .provider("$idle", Idle)
  .name;
