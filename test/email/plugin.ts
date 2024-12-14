import type $ from '@escapace/typelevel'

import type { Action, Model, Next, Options, Payload, Plugin, Types } from '../../src'

import type { Settings } from './types'

export const SYMBOL_PLUGIN = Symbol.for('Plugin')

export interface ActionPlugin<T extends Array<Types<Settings>>> {
  payload: T
  type: typeof SYMBOL_PLUGIN
}

declare module './types' {
  export interface State {
    plugins: Array<Types<Settings>>
  }

  export interface InitialState {
    plugins: []
  }

  export interface Email<T> {
    plugin<A extends Types<Settings>, B extends Types<Settings>, C extends Types<Settings>>(
      A: Plugin<A, Settings>,
      B: Plugin<B, Settings>,
      C: Plugin<C, Settings>,
    ): Next<Settings, T, ActionPlugin<Array<A | B | C>>>

    plugin<
      A extends Types<Settings>,
      B extends Types<Settings>,
      C extends Types<Settings>,
      D extends Types<Settings>,
    >(
      A: Plugin<A, Settings>,
      B: Plugin<B, Settings>,
      C: Plugin<C, Settings>,
      D: Plugin<D, Settings>,
    ): Next<Settings, T, ActionPlugin<Array<A | B | C | D>>>

    plugin<A extends Types<Settings>, B extends Types<Settings>>(
      A: Plugin<A, Settings>,
      B: Plugin<B, Settings>,
    ): Next<Settings, T, ActionPlugin<Array<A | B>>>

    plugin<U extends Types<Settings>>(
      ...payload: Array<Plugin<U, Settings>>
    ): Next<Settings, T, ActionPlugin<U[]>>
  }

  export interface Reducer<T extends Action[]> {
    [SYMBOL_PLUGIN]: {
      plugins: Array<$.Values<Payload<$.Values<T>, typeof SYMBOL_PLUGIN>>>
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  export interface Category<T extends Model<State>> {
    [SYMBOL_PLUGIN]: {
      [Options.Conflicts]: typeof SYMBOL_SEND
      [Options.Dependencies]: never
      [Options.Enabled]: $.True
      [Options.Keys]: 'plugin'
      [Options.Once]: $.False
      [Options.Type]: typeof SYMBOL_PLUGIN
    }
  }
}
