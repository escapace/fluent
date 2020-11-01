import $ from '@escapace/typelevel'
import {
  Action,
  FluentInterface,
  Model,
  Next,
  Options,
  Payload
} from '../../src'

export declare const EMAIL_INTERFACE: unique symbol
export declare const EMAIL_SPECIFICATION: unique symbol
export declare const EMAIL_REDUCER: unique symbol

export const SYMBOL_TO = Symbol.for('To')
export const SYMBOL_SUBJECT = Symbol.for('Subject')
export const SYMBOL_BODY = Symbol.for('Body')
export const SYMBOL_SEND = Symbol.for('Send')

export interface ActionTo<T extends string> {
  type: typeof SYMBOL_TO
  payload: T
}

export interface ActionSubject<T extends string> {
  type: typeof SYMBOL_SUBJECT
  payload: T
}

export interface ActionBody<T extends string> {
  type: typeof SYMBOL_BODY
  payload: T
}

export interface ActionSend {
  type: typeof SYMBOL_SEND
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
  [SYMBOL_TO]: {
    [Options.Type]: typeof SYMBOL_TO
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'to'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [SYMBOL_SUBJECT]: {
    [Options.Type]: typeof SYMBOL_SUBJECT
    [Options.Once]: $.True
    [Options.Dependencies]: typeof SYMBOL_TO
    [Options.Keys]: 'subject'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [SYMBOL_BODY]: {
    [Options.Type]: typeof SYMBOL_BODY
    [Options.Once]: $.True
    [Options.Dependencies]: typeof SYMBOL_TO | typeof SYMBOL_SUBJECT
    [Options.Keys]: 'body'
    [Options.Enabled]: $.True
    [Options.Conflicts]: never
  }

  [SYMBOL_SEND]: {
    [Options.Type]: typeof SYMBOL_SEND
    [Options.Once]: $.True
    [Options.Dependencies]: never
    [Options.Keys]: 'send'
    [Options.Enabled]: $.Equal<$.Widen<T['state']['body']>, string>
    [Options.Conflicts]: never
  }
}

export interface Reducer<T extends Action[]> {
  [SYMBOL_TO]: { to: Payload<$.Values<T>, typeof SYMBOL_TO> }
  [SYMBOL_SUBJECT]: { subject: Payload<$.Values<T>, typeof SYMBOL_SUBJECT> }
  [SYMBOL_BODY]: { body: Payload<$.Values<T>, typeof SYMBOL_BODY> }
  [SYMBOL_SEND]: { sent: Payload<$.Values<T>, typeof SYMBOL_SEND> }
}

export interface InitialState {
  sent: false
  to: undefined
  subject: undefined
  body: undefined
}

export interface Settings {
  [Options.Interface]: typeof EMAIL_INTERFACE
  [Options.Specification]: typeof EMAIL_SPECIFICATION
  [Options.Reducer]: typeof EMAIL_REDUCER
  [Options.InitialState]: InitialState
  [Options.State]: State
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [EMAIL_INTERFACE]: Email<$.Cast<A, Model<State>>>
    [EMAIL_SPECIFICATION]: Category<$.Cast<A, Model<State>>>
    [EMAIL_REDUCER]: Reducer<$.Cast<A, Action[]>>
  }
}
