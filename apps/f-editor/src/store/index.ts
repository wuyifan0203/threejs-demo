import { useCADStore } from "./modules/cad"

const store = {
    get cadStore() {
        return useCADStore()
    },

    resetStore() {
        this.cadStore.$reset()
    }
}

export { store}