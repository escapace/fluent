import { Options, type Plugin, type Types, builder } from '../../src'
import {
  type ActionBody,
  type ActionSend,
  type ActionSubject,
  type ActionTo,
  SYMBOL_BODY,
  SYMBOL_SEND,
  SYMBOL_SUBJECT,
  SYMBOL_TO,
  type Settings,
} from './types'

import { type ActionPlugin, SYMBOL_PLUGIN } from './plugin'

import { filter, find, flatten, get, isString, map } from 'lodash-es'

export { attachment } from './attachment'
export { cc } from './cc'

export const email = builder<Settings>([
  {
    [Options.Interface]: (dispatch) => ({
      to<T extends string>(value: T) {
        return dispatch<ActionTo<T>>({ payload: value, type: SYMBOL_TO })
      },
    }),
    [Options.Keys]: ['to'],
    [Options.Once]: true,
    [Options.Reducer]: (log) => ({
      to: get(
        find(log, (action) => action.type === SYMBOL_TO),
        'payload',
      ),
    }),
    [Options.Type]: SYMBOL_TO,
  },
  {
    [Options.Dependencies]: [SYMBOL_TO],
    [Options.Interface]: (dispatch) => ({
      subject<T extends string>(value: T) {
        return dispatch<ActionSubject<T>>({
          payload: value,
          type: SYMBOL_SUBJECT,
        })
      },
    }),
    [Options.Keys]: ['subject'],
    [Options.Once]: true,
    [Options.Reducer]: (log) => ({
      subject: get(
        find(log, (action) => action.type === SYMBOL_SUBJECT),
        'payload',
      ),
    }),
    [Options.Type]: SYMBOL_SUBJECT,
  },
  {
    [Options.Dependencies]: () => [SYMBOL_TO, SYMBOL_SUBJECT],
    [Options.Interface]: (dispatch) => ({
      body<T extends string>(value: T) {
        return dispatch<ActionBody<T>>({ payload: value, type: SYMBOL_BODY })
      },
    }),
    [Options.Keys]: ['body'],
    [Options.Once]: true,
    [Options.Reducer]: (log) => ({
      body: get(
        find(log, (action) => action.type === SYMBOL_BODY),
        'payload',
      ),
    }),
    [Options.Type]: SYMBOL_BODY,
  },
  {
    [Options.Enabled]: (_, state) => isString(state.body),
    [Options.Interface]: (dispatch) => ({
      send() {
        return dispatch<ActionSend>({ payload: true, type: SYMBOL_SEND })
      },
    }),
    [Options.Keys]: ['send'],
    [Options.Once]: true,
    [Options.Reducer]: (log) => ({
      sent: get(
        find(log, (action) => action.type === SYMBOL_SEND),
        'payload',
        false,
      ),
    }),
    [Options.Type]: SYMBOL_SEND,
  },
  {
    [Options.Conflicts]: [SYMBOL_SEND],
    [Options.Interface]: (dispatch) => ({
      plugin<T extends Types<Settings>>(...plugins: Array<Plugin<T, Settings>>) {
        return dispatch<ActionPlugin<T[]>>(
          {
            payload: map(plugins, (p) => p[Options.Type]),
            type: SYMBOL_PLUGIN,
          },
          ...plugins,
        )
      },
    }),
    [Options.Keys]: ['plugin'],
    [Options.Once]: false,
    [Options.Reducer]: (log) => ({
      plugins: flatten(
        map(
          filter(log, (action) => action.type === SYMBOL_PLUGIN),
          (action) => action.payload,
        ),
      ),
    }),
    [Options.Type]: SYMBOL_PLUGIN,
  },
])
