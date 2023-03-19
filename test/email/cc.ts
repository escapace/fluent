import { SYMBOL_TO, Settings } from './types'

import $ from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload, Plugin } from '../../src'

import { filter, includes, map } from 'lodash-es'

export const SYMBOL_CC = Symbol.for('CC')

export interface ActionCC<T extends string> {
  type: typeof SYMBOL_CC
  payload: T
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
      [Options.Type]: typeof SYMBOL_CC
      [Options.Once]: $.False
      [Options.Dependencies]: typeof SYMBOL_TO
      [Options.Keys]: 'cc'
      [Options.Enabled]: $.Contains<
        $.Values<T['state']['plugins']>,
        typeof SYMBOL_CC
      >
      [Options.Conflicts]: typeof SYMBOL_SEND
    }
  }
}

export const cc: Plugin<typeof SYMBOL_CC, Settings> = {
  [Options.Type]: SYMBOL_CC,
  [Options.Once]: false,
  [Options.Keys]: ['cc'],
  [Options.Dependencies]: [SYMBOL_TO],
  [Options.Enabled]: (_, state) => includes(state.plugins, SYMBOL_CC),
  [Options.Interface]: (dispatch) => ({
    cc<T extends string>(value: T) {
      return dispatch<ActionCC<T>>({ type: SYMBOL_CC, payload: value })
    }
  }),
  [Options.Reducer]: (log) => ({
    cc: map(
      filter(log, (action) => action.type === SYMBOL_CC),
      (action) => action.payload
    )
  })
}
