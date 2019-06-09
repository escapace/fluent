import { Types } from './types'

import { TL } from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload } from './lib'

interface ActionPlugin<T extends Types[]> {
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
    plugin<U extends Types[]>(...payload: U): Next<Settings, T, ActionPlugin<U>>
  }

  export interface Reducer<_T, T extends Action = TL.Cast<_T, Action>> {
    [Types.Plugin]: { plugins: Array<TL.Values<Payload<T, Types.Plugin>>> }
  }

  export interface Category<
    _T,
    T extends Model<State> = TL.Cast<_T, Model<State>>
  > {
    [Types.Plugin]: {
      [Options.TYPE]: Types.Plugin
      [Options.ONCE]: TL.False
      [Options.DEPENDENCIES]: never
      [Options.KEYS]: 'plugin'
      [Options.ENABLED]: TL.True
      [Options.CONFLICTS]: never
    }
  }
}
