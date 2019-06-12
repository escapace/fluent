import { Options, Plugin, builder } from '../../src'
import {
  ActionBody,
  ActionPlugin,
  ActionSend,
  ActionSubject,
  ActionTo,
  Settings,
  Types
} from './types'
import { filter, find, flatten, get, isString, map } from 'lodash'

export { attachment } from './attachment'
export { cc } from './cc'

export const email = builder<Settings>([
  {
    [Options.Type]: Types.To,
    [Options.Once]: true,
    [Options.Keys]: ['to'],
    [Options.Reducer]: log => ({
      to: get(find(log, action => action.type === Types.To), 'payload')
    }),
    [Options.Interface]: dispatch => ({
      to<T extends string>(value: T) {
        return dispatch<ActionTo<T>>({ type: Types.To, payload: value })
      }
    })
  },
  {
    [Options.Type]: Types.Subject,
    [Options.Once]: true,
    [Options.Keys]: ['subject'],
    [Options.Dependencies]: [Types.To],
    [Options.Reducer]: log => ({
      subject: get(
        find(log, action => action.type === Types.Subject),
        'payload'
      )
    }),
    [Options.Interface]: dispatch => ({
      subject<T extends string>(value: T) {
        return dispatch<ActionSubject<T>>({
          type: Types.Subject,
          payload: value
        })
      }
    })
  },
  {
    [Options.Type]: Types.Body,
    [Options.Once]: true,
    [Options.Keys]: ['body'],
    [Options.Dependencies]: [Types.To, Types.Subject],
    [Options.Reducer]: log => ({
      body: get(find(log, action => action.type === Types.Body), 'payload')
    }),
    [Options.Interface]: dispatch => ({
      body<T extends string>(value: T) {
        return dispatch<ActionBody<T>>({ type: Types.Body, payload: value })
      }
    })
  },
  {
    [Options.Type]: Types.Send,
    [Options.Once]: true,
    [Options.Keys]: ['send'],
    [Options.Reducer]: log => ({
      sent: get(
        find(log, action => action.type === Types.Send),
        'payload',
        false
      )
    }),
    [Options.Enabled]: (_, state) => isString(state.body),
    [Options.Interface]: dispatch => ({
      send() {
        return dispatch<ActionSend>({ type: Types.Send, payload: true })
      }
    })
  },
  {
    [Options.Type]: 'Plugin' as Types.Plugin,
    [Options.Once]: false,
    [Options.Keys]: ['plugin'],
    [Options.Conflicts]: [Types.Send],
    [Options.Reducer]: log => ({
      plugins: flatten(
        map(
          filter(log, action => action.type === 'Plugin' as Types.Plugin),
          action => action.payload
        )
      )
    }),
    [Options.Interface]: dispatch => ({
      plugin<T extends Types.CC | Types.Attachment>(
        ...plugins: Plugin<T, Settings>[]
      ) {
        return dispatch<ActionPlugin<T[]>>(
          { type: 'Plugin' as Types.Plugin, payload: map(plugins, p => p[Options.Type]) },
          ...plugins
        )
      }
    })
  }
])
