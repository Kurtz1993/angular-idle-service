module Idle.Modules {
    export class IdleLocalStorage {
        static $inject = ['$window'];
        private storage: Storage;
        constructor($window: ng.IWindowService) {
            try {
                let s = $window.localStorage;
                s.setItem('idleStorage', '');
                s.removeItem('idleStorage');
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
        public set(key: string, value: string): void {
            this.storage.setItem(`idle.${key}`, angular.toJson(value));
        }

        /**
         * Gets the specified item.
         * @param key The key for the item to retrieve.
         * @returns The value for the key in JSON format.
         */
        public get(key: string): any {
            return angular.fromJson(this.storage.getItem(`idle.${key}`));
        }

        /**
         * Removes the specified item.
         * @param key The key for the item to remove.
         */
        public remove(key: string): void {
            this.storage.removeItem(`idle.${key}`);
        }

        /**
         * Gets the whole storage.
         * @returns The LocalStorage object.
         */
        private _wrapped(): Storage {
            return this.storage;
        }
    }
}