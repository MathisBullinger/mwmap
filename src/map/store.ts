import { makeAutoObservable } from 'mobx'
import filters, { Filter } from 'src/map/filters'

type FilterInterface<T> = {
  readonly [K in keyof T]: T[K] extends readonly string[]
    ? { [N in T[K][number]]: boolean }
    : FilterInterface<T[K]>
}

class Store {
  constructor() {
    const buildObj = (v: Filter[string]) =>
      Object.fromEntries(
        Array.isArray(v)
          ? v.map(k => [k, false])
          : Object.entries(v).map(([k, v]) => [k, buildObj(v)])
      )

    Object.assign(this, buildObj(filters))
    makeAutoObservable(this)
  }
}

export default new Store() as FilterInterface<typeof filters>
