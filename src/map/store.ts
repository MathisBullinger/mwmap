import { makeAutoObservable } from 'mobx'
import filters, { Filter } from 'src/map/filters'

type FilterInterface<T extends Filter> = {
  [K in keyof T]: T[K] extends Filter ? FilterInterface<T[K]> : boolean
}

class Store {
  constructor() {
    const buildObj = (v: Filter[string]) =>
      !v
        ? false
        : Object.fromEntries(
            Object.entries(v).map(([k, v]) => [k, buildObj(v)])
          )

    Object.assign(this, buildObj(filters))
    makeAutoObservable(this)
  }
}

export default new Store() as FilterInterface<typeof filters>
