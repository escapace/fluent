import type $ from '@escapace/typelevel'
import type { Action, FluentInterface, Model, Next, Options, Payload } from '../../src'

export declare const EMAIL_INTERFACE: unique symbol
export declare const EMAIL_SPECIFICATION: unique symbol
export declare const EMAIL_REDUCER: unique symbol

export const SYMBOL_TO = Symbol.for('To')
export const SYMBOL_SUBJECT = Symbol.for('Subject')
export const SYMBOL_BODY = Symbol.for('Body')
export const SYMBOL_SEND = Symbol.for('Send')

export interface ActionTo<T extends string> {
  payload: T
  type: typeof SYMBOL_TO
}

export interface ActionSubject<T extends string> {
  payload: T
  type: typeof SYMBOL_SUBJECT
}

export interface ActionBody<T extends string> {
  payload: T
  type: typeof SYMBOL_BODY
}

export interface ActionSend {
  payload: true
  type: typeof SYMBOL_SEND
}

export interface State {
  body?: string
  sent: boolean
  subject?: string
  to?: string
}

export interface Email<T extends Model<State>> extends FluentInterface<T> {
  body: <U extends string>(payload: U) => Next<Settings, T, ActionBody<U>>

  send: () => Next<Settings, T, ActionSend>

  subject: <U extends string>(payload: U) => Next<Settings, T, ActionSubject<U>>

  to: <U extends string>(payload: U) => Next<Settings, T, ActionTo<U>>
}

export interface Category<T extends Model<State>> {
  [SYMBOL_BODY]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof SYMBOL_SUBJECT | typeof SYMBOL_TO
    [Options.Enabled]: $.True
    [Options.Keys]: 'body'
    [Options.Once]: $.True
    [Options.Type]: typeof SYMBOL_BODY
  }

  [SYMBOL_SEND]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.Equal<$.Widen<T['state']['body']>, string>
    [Options.Keys]: 'send'
    [Options.Once]: $.True
    [Options.Type]: typeof SYMBOL_SEND
  }

  [SYMBOL_SUBJECT]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: typeof SYMBOL_TO
    [Options.Enabled]: $.True
    [Options.Keys]: 'subject'
    [Options.Once]: $.True
    [Options.Type]: typeof SYMBOL_SUBJECT
  }

  [SYMBOL_TO]: {
    [Options.Conflicts]: never
    [Options.Dependencies]: never
    [Options.Enabled]: $.True
    [Options.Keys]: 'to'
    [Options.Once]: $.True
    [Options.Type]: typeof SYMBOL_TO
  }
}

export interface Reducer<T extends Action[]> {
  [SYMBOL_BODY]: { body: Payload<$.Values<T>, typeof SYMBOL_BODY> }
  [SYMBOL_SEND]: { sent: Payload<$.Values<T>, typeof SYMBOL_SEND> }
  [SYMBOL_SUBJECT]: { subject: Payload<$.Values<T>, typeof SYMBOL_SUBJECT> }
  [SYMBOL_TO]: { to: Payload<$.Values<T>, typeof SYMBOL_TO> }
}

export interface InitialState {
  body: undefined
  sent: false
  subject: undefined
  to: undefined
}

export interface Settings {
  [Options.InitialState]: InitialState
  [Options.Interface]: typeof EMAIL_INTERFACE
  [Options.Reducer]: typeof EMAIL_REDUCER
  [Options.Specification]: typeof EMAIL_SPECIFICATION
  [Options.State]: State
}

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [EMAIL_INTERFACE]: Email<$.Cast<A, Model<State>>>
    [EMAIL_REDUCER]: Reducer<$.Cast<A, Action[]>>
    [EMAIL_SPECIFICATION]: Category<$.Cast<A, Model<State>>>
  }
}
