export function getItemFromLocalStorage(key: string) {
    return localStorage.getItem(key);
}

export function setItemInLocalStorage(key: string, value: string) {
    localStorage.setItem(key, value);
}

export function removeItemFromLocalStorage(key: string) {
    localStorage.removeItem(key);
}

export function removeAllItemsFromLocalStorage() {
    localStorage.clear();
}