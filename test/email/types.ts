/* tslint:disable completed-docs */

import $ from '@escapace/typelevel'
import {
  Action,
  FluentInterface,
  Model,
  Next,
  Options,
  Payload
} from '../../src'
// tslint:disable-next-line: no-circular-imports
export { ActionPlugin } from './plugin'

export declare const EMAIL_INTERFACE: unique symbol
export declare const EMAIL_CATEGORY: unique symbol
export declare const EMAIL_REDUCER: unique symbol

export enum Types {
  To = 'To',
  Subject = 'Subject',
  Body = 'Body',
  Send = 'Send'
}

export interface ActionTo<T extends string> {
  type: Types.To
  payload: T
}

export interface ActionSubject<T extends string> {
  type: Types.Subject
  payload: T
}

export interface ActionBody<T extends string> {
  type: Types.Body
  payload: T
}

export interface ActionSend {
  type: Types.Send
  payload: true
}

export interface State {
  to?: string
  subject?: string
  body?: string
  sent: boolean
}

export interface Email<T extends Model<State>> extends FluentInterface<T> {
  to<U extends string>(payload: U): Next<Settings, T, ActionTo<U>>

  subject<U extends string>(payload: U): Next<Settings, T, ActionSubject<U>>

  send(): Next<Settings, T, ActionSend>

  body<U extends string>(payload: U): Next<Settings, T, ActionBody<U>>
}

export interface Category<T extends Model<State>> {
  [Types.To]: {
    [Options.Type]: Types.To
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'to'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [Types.Subject]: {
    [Options.Type]: Types.Subject
    [Options.Once]: $.True
    [Options.Dependencies]: Types.To
    [Options.Keys]: 'subject'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [Types.Body]: {
    [Options.Type]: Types.Body
    [Options.Once]: $.True
    [Options.Dependencies]: Types.To | Types.Subject
    [Options.Keys]: 'body'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [Types.Send]: {
    [Options.Type]: Types.Send
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'send'
    [Options.Enabled]: $.Equal<$.Widen<T['state']['body']>, string>
    [Options.Conflicts]: never
  }
}

export interface Reducer<T extends Action> {
  [Types.To]: { to: Payload<T, Types.To> }
  [Types.Subject]: { subject: Payload<T, Types.Subject> }
  [Types.Body]: { body: Payload<T, Types.Body> }
  [Types.Send]: { sent: Payload<T, Types.Send> }
}

export interface INITIAL_STATE {
  sent: false
  to: undefined
  subject: undefined
  body: undefined
}

export interface Settings {
  [Options.Interface]: typeof EMAIL_INTERFACE
  [Options.Category]: typeof EMAIL_CATEGORY
  [Options.Reducer]: typeof EMAIL_REDUCER
  [Options.InitialState]: INITIAL_STATE
  [Options.State]: State
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [EMAIL_INTERFACE]: Email<$.Cast<A, Model<State>>>
    [EMAIL_CATEGORY]: Category<$.Cast<A, Model<State>>>
    [EMAIL_REDUCER]: Reducer<$.Cast<A, Action>>
  }
}
