import * as angular from "angular";
import { AlternativeStorage } from "./alternative-storage";

export class IdleStorage {
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

  /**
   * Sets an item to the local storage.
   * @param key The key for the item.
   * @param value The value of the item.
   */
  set(key: string, value: any) {
    this.storage.setItem(`idle.${key}`, angular.toJson(value));
  }

  /**
   * Gets the specified item.
   * @param key The key for the item to retrieve.
   * @returns The value for the key in JSON format.
   */
  get(key: string): Object {
    return angular.fromJson(this.storage.getItem(`idle.${key}`));
  }

  /**
   * Removes the specified item.
   * @param key The key for the item to remove.
   */
  remove(key: string): void {
    this.storage.removeItem(`idle.${key}`);
  }
}
