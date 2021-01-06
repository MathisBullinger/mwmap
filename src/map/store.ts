import { makeAutoObservable } from 'mobx'
import filters, { Filter } from 'src/map/filters'

type FilterInterface<T extends Filter> = {
  [K in keyof T]: T[K] extends Filter ? FilterInterface<T[K]> : boolean
}

class Store {
  constructor() {
    const buildObj = (v: Filter[string]) =>
      Array.isArray(v)
        ? false
        : Object.fromEntries(
            Object.entries(v).map(([k, v]) => [k, buildObj(v)])
          )

    Object.assign(this, buildObj(filters))
    makeAutoObservable(this)
  }

  set(obj: any, v: boolean) {
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'boolean') obj[key] = v
      else this.set(obj[key], v)
    }
  }
}

const store = new Store() as Store & FilterInterface<typeof filters>

store.set(store.Locations, true)

export default store
