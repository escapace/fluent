import { Types } from './types'

import $ from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload, Plugin } from '../../src'

export interface ActionPlugin<T extends Types[]> {
  type: Types.Plugin
  payload: T
}

declare module './types' {
  enum Types {
    Plugin = 'Plugin'
  }

  export interface State {
    plugins: Types[]
  }

  export interface INITIAL_STATE {
    plugins: []
  }

  export interface Email<T> {
    plugin<U extends Types>(...payload: Plugin<U, Settings>[]): Next<Settings, T, ActionPlugin<U[]>>
  }

  export interface Reducer<T extends Action> {
    [Types.Plugin]: { plugins: Array<$.Values<Payload<T, Types.Plugin>>> }
  }

  export interface Category<
    T extends Model<State>
  > {
    [Types.Plugin]: {
      [Options.Type]: Types.Plugin
      [Options.Once]: $.False
      [Options.Dependencies]: never
      [Options.Keys]: 'plugin'
      [Options.Enabled]: $.True
      [Options.Conflicts]: Types.Send
    }
  }
}
