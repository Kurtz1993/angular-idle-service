import * as angular from "angular";
import { KeepAliveProvider } from "./providers/keep-alive.provider";
import { IdleStorage } from "./storage/idle-storage";
import { IdleProvider } from "./providers/idle.provider";

export const idleModule = angular
  .module("$idle", [])
  .service("$idleLocalStorage", IdleStorage)
  .provider("$keepalive", KeepAliveProvider)
  .provider("$idle", IdleProvider)
  .name;

export * from "./types/idle.types";
export * from "./types/keepalive.types";