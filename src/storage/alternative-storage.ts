export class AlternativeStorage implements Storage {
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
    if (typeof this.storage[key] !== "undefined") {
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
