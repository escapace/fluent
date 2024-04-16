import { SYMBOL_TO, type Settings } from './types'

import type $ from '@escapace/typelevel'

import { type Action, type Model, type Next, Options, type Payload, type Plugin } from '../../src'

import { filter, includes, map } from 'lodash-es'

export const SYMBOL_CC = Symbol.for('CC')

export interface ActionCC<T extends string> {
  payload: T
  type: typeof SYMBOL_CC
}

declare module './types' {
  export interface State {
    cc?: string[]
  }

  export interface InitialState {
    cc?: []
  }

  export interface Email<T extends Model<State>> {
    cc<U extends string>(payload: U): Next<Settings, T, ActionCC<U>>
  }

  export interface Reducer<T extends Action[]> {
    [SYMBOL_CC]: {
      cc: Array<Payload<$.Values<T>, typeof SYMBOL_CC>> | undefined
    }
  }

  export interface Category<T extends Model<State>> {
    [SYMBOL_CC]: {
      [Options.Conflicts]: typeof SYMBOL_SEND
      [Options.Dependencies]: typeof SYMBOL_TO
      [Options.Enabled]: $.Contains<
        $.Values<T['state']['plugins']>,
        typeof SYMBOL_CC
      >
      [Options.Keys]: 'cc'
      [Options.Once]: $.False
      [Options.Type]: typeof SYMBOL_CC
    }
  }
}

export const cc: Plugin<typeof SYMBOL_CC, Settings> = {
  [Options.Dependencies]: [SYMBOL_TO],
  [Options.Enabled]: (_, state) => includes(state.plugins, SYMBOL_CC),
  [Options.Interface]: (dispatch) => ({
    cc<T extends string>(value: T) {
      return dispatch<ActionCC<T>>({ payload: value, type: SYMBOL_CC })
    }
  }),
  [Options.Keys]: ['cc'],
  [Options.Once]: false,
  [Options.Reducer]: (log) => ({
    cc: map(
      filter(log, (action) => action.type === SYMBOL_CC),
      (action) => action.payload
    )
  }),
  [Options.Type]: SYMBOL_CC
}
