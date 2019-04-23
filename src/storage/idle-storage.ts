import * as angular from "angular";
import { AlternativeStorage } from "./alternative-storage";

export class IdleStorage implements IIdleStorage {
  static $inject = ["$window"];
  private storage: Storage;

  constructor($window: ng.IWindowService) {
    // This is done because Safari issues with the localStorage when accessing on private tab.
    try {
      let s = $window.localStorage;
      s.setItem("idleStorage", "");
      s.removeItem("idleStorage");
      this.storage = s;
    } catch (err) {
      this.storage = new AlternativeStorage();
    }
  }

  set(key: string, value: any) {
    this.storage.setItem(`idle.${key}`, angular.toJson(value));
  }

  get(key: string): Object {
    return angular.fromJson(this.storage.getItem(`idle.${key}`));
  }

  remove(key: string): void {
    this.storage.removeItem(`idle.${key}`);
  }
}
