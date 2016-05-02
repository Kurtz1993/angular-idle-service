module Idle.Modules {
    export class AlternativeStorage implements Storage{
        [index: number]: any;
        public length: number = 0;
        private storageMap: any;
        constructor(){}
        
        /**
         * Stores an item with the specified key/value pair.
         * @param key The key for the item.
         * @param value The value of the item.
         */
        public setItem(key: string, value: any): void {
            this.storageMap[key] = value;
        }
        
        /**
         * Gets the specified item.
         * @param key The key of the item to retrieve.
         * @returns The specified item or null if not found.
         */
        public getItem(key: string): any {
            if (typeof this.storageMap[key] !== 'undefined') {
                return this.storageMap[key];
            }
            return null;
        }
        
        /**
         * Removes the specified item.
         * @param key THe key of the item to remove.
         */
        public removeItem(key: string): void {
            this.storageMap[key] = undefined;
        }
        
        /**
         * Clears the entire storage.
         */
        public clear(): void {
            this.storageMap = {};
        }
        
        public key(index: number): string {
            return this.storageMap[index];
        } 
    }
}