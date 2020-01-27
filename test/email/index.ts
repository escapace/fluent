/* tslint:disable: no-unsafe-any */

import { Options, Plugin, Types, builder } from '../../src'
import {
  ActionBody,
  ActionSend,
  ActionSubject,
  ActionTo,
  SYMBOL_BODY,
  SYMBOL_SEND,
  SYMBOL_SUBJECT,
  SYMBOL_TO,
  Settings
} from './types'

import { ActionPlugin, SYMBOL_PLUGIN } from './plugin'

import { filter, find, flatten, get, isString, map } from 'lodash'

export { attachment } from './attachment'
export { cc } from './cc'

export const email = builder<Settings>([
  {
    [Options.Type]: SYMBOL_TO,
    [Options.Once]: true,
    [Options.Keys]: ['to'],
    [Options.Reducer]: log => ({
      to: get(
        find(log, action => action.type === SYMBOL_TO),
        'payload'
      )
    }),
    [Options.Interface]: dispatch => ({
      to<T extends string>(value: T) {
        return dispatch<ActionTo<T>>({ type: SYMBOL_TO, payload: value })
      }
    })
  },
  {
    [Options.Type]: SYMBOL_SUBJECT,
    [Options.Once]: true,
    [Options.Keys]: ['subject'],
    [Options.Dependencies]: [SYMBOL_TO],
    [Options.Reducer]: log => ({
      subject: get(
        find(log, action => action.type === SYMBOL_SUBJECT),
        'payload'
      )
    }),
    [Options.Interface]: dispatch => ({
      subject<T extends string>(value: T) {
        return dispatch<ActionSubject<T>>({
          type: SYMBOL_SUBJECT,
          payload: value
        })
      }
    })
  },
  {
    [Options.Type]: SYMBOL_BODY,
    [Options.Once]: true,
    [Options.Keys]: ['body'],
    [Options.Dependencies]: () => [SYMBOL_TO, SYMBOL_SUBJECT],
    [Options.Reducer]: log => ({
      body: get(
        find(log, action => action.type === SYMBOL_BODY),
        'payload'
      )
    }),
    [Options.Interface]: dispatch => ({
      body<T extends string>(value: T) {
        return dispatch<ActionBody<T>>({ type: SYMBOL_BODY, payload: value })
      }
    })
  },
  {
    [Options.Type]: SYMBOL_SEND,
    [Options.Once]: true,
    [Options.Keys]: ['send'],
    [Options.Reducer]: log => ({
      sent: get(
        find(log, action => action.type === SYMBOL_SEND),
        'payload',
        false
      )
    }),
    [Options.Enabled]: (_, state) => isString(state.body),
    [Options.Interface]: dispatch => ({
      send() {
        return dispatch<ActionSend>({ type: SYMBOL_SEND, payload: true })
      }
    })
  },
  {
    [Options.Type]: SYMBOL_PLUGIN,
    [Options.Once]: false,
    [Options.Keys]: ['plugin'],
    [Options.Conflicts]: [SYMBOL_SEND],
    [Options.Reducer]: log => ({
      plugins: flatten(
        map(
          filter(log, action => action.type === SYMBOL_PLUGIN),
          action => action.payload
        )
      )
    }),
    [Options.Interface]: dispatch => ({
      plugin<T extends Types<Settings>>(
        ...plugins: Array<Plugin<T, Settings>>
      ) {
        return dispatch<ActionPlugin<T[]>>(
          { type: SYMBOL_PLUGIN, payload: map(plugins, p => p[Options.Type]) },
          ...plugins
        )
      }
    })
  }
])
