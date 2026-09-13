import { Store } from '@tanstack/store'

export function createStore<TState>(initialState: TState): Store<TState> {
  return new Store<TState>(initialState)
}

export { Store }
