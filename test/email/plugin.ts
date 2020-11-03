import $ from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload, Plugin, Types } from '../../src'

import { Settings } from './types'

export const SYMBOL_PLUGIN = Symbol.for('Plugin')

export interface ActionPlugin<T extends Array<Types<Settings>>> {
  type: typeof SYMBOL_PLUGIN
  payload: T
}

declare module './types' {
  export interface State {
    plugins: Array<Types<Settings>>
  }

  export interface InitialState {
    plugins: []
  }

  export interface Email<T> {
    plugin<A extends Types<Settings>, B extends Types<Settings>>(
      A: Plugin<A, Settings>,
      B: Plugin<B, Settings>
    ): Next<Settings, T, ActionPlugin<Array<A | B>>>

    plugin<
      A extends Types<Settings>,
      B extends Types<Settings>,
      C extends Types<Settings>
    >(
      A: Plugin<A, Settings>,
      B: Plugin<B, Settings>,
      C: Plugin<C, Settings>
    ): Next<Settings, T, ActionPlugin<Array<A | B | C>>>

    plugin<
      A extends Types<Settings>,
      B extends Types<Settings>,
      C extends Types<Settings>,
      D extends Types<Settings>
    >(
      A: Plugin<A, Settings>,
      B: Plugin<B, Settings>,
      C: Plugin<C, Settings>,
      D: Plugin<D, Settings>
    ): Next<Settings, T, ActionPlugin<Array<A | B | C | D>>>

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
      [Options.Type]: typeof SYMBOL_PLUGIN
      [Options.Once]: $.False
      [Options.Dependencies]: never
      [Options.Keys]: 'plugin'
      [Options.Enabled]: $.True
      [Options.Conflicts]: typeof SYMBOL_SEND
    }
  }
}
