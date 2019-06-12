import { Settings, Types } from './types'

import $ from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload, Plugin } from '../../src'

import { filter, includes, map } from 'lodash'

export interface ActionCC<T extends string> {
  type: Types.CC
  payload: T
}

declare module './types' {
  enum Types {
    CC = 'CC'
  }

  export interface State {
    cc: string[] | undefined
  }

  export interface INITIAL_STATE {
    cc: [] | undefined
  }

  export interface Email<T extends Model<State>> {
    cc<U extends string>(payload: U): Next<Settings, T, ActionCC<U>>
  }

  export interface Reducer<T extends Action> {
    [Types.CC]: { cc: Array<Payload<T, Types.CC>> | undefined }
  }

  export interface Category<
    T extends Model<State>
  > {
    [Types.CC]: {
      [Options.Type]: Types.CC
      [Options.Once]: $.False
      [Options.Dependencies]: Types.To
      [Options.Keys]: 'cc'
      [Options.Enabled]: $.Contains<$.Values<T['state']['plugins']>, Types.CC>
      [Options.Conflicts]: Types.Send
    }
  }
}

// export const cc: Plugin<Settings> = {
//   [Options.Type]: Types.CC,
//   [Options.Once]: false,
//   [Options.Interface]: {
//     cc() {}
//   },
//   [Options.Keys]: ['cc'],
//   [Options.Dependencies]: [Types.To],
//   [Options.Enabled]: (_, state) => includes(state.plugins, Types.CC),
//   [Options.Conflicts]: [Types.Send],
//   [Options.State]: { cc: [] },
//   [Options.Reducer]: log => ({
//     cc: map(
//       filter(log, action => action.type === Types.CC),
//       action => action.payload
//     )
//   })
// }

export const cc: Plugin<Types.CC, Settings> = {
    [Options.Type]: 'CC' as Types.CC,
    [Options.Once]: false,
    [Options.Keys]: ['cc'],
    [Options.Dependencies]: [Types.To],
    [Options.Enabled]: (_, state) => includes(state.plugins, 'CC' as Types.CC),
    [Options.Interface]: dispatch => ({
      cc<T extends string>(value: T) {
        return dispatch<ActionCC<T>>({ type: 'CC' as Types.CC, payload: value })
      }
    }),
    [Options.Reducer]: log => ({
      cc: map(
          filter(log, action => action.type === 'CC' as Types.CC),
          action => action.payload
        )
    })
  }
