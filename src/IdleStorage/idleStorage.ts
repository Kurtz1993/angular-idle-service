module IdlePackage.Modules {
  export class IdleStorage implements IIdleStorage {
    static $inject = ['$window'];
    private storage: Storage;

    constructor($window: ng.IWindowService) {
      // This is done because Safari issues with the localStorage when accessing on private tab.
      try {
        let s = $window.localStorage;
        s.setItem('idleStorage', '');
        s.removeItem('idleStorage');
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

  class AlternativeStorage implements Storage {
    [index: number]: string;
    private storage: any;
    public length: number;
    /**
     * Sets a value into the storage with the given key.
     * @param key The key for the item.
     * @param value The value of the item.
     */
    setItem(key: string, value: any): void {
      this.storage[key] = value;
    }

    /**
     * Gets the specified item by key.
     * @param key The key of the item.
     * @returns The item or null if it doesn't exist.
     */
    getItem(key: string): any {
      if (typeof this.storage[key] !== 'undefined') {
        return this.storage[key];
      }

      return null;
    }

    /**
     * Removes the specified item.
     * @param key The key of the item.
     */
    removeItem(key: string): void {
      this.storage[key] = undefined;
    }

    /**
     * Clears the whole storage object.
     */
    clear(): void {
      this.storage = {};
    }

    key(index: number): string {
      return this.storage[index];
    }
  }
}