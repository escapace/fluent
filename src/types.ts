/* tslint:disable completed-docs */

import { TL } from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload } from './lib'

export declare const EMAIL_INTERFACE: unique symbol
export declare const EMAIL_CATEGORY: unique symbol
export declare const EMAIL_REDUCER: unique symbol

export enum Types {
  To = 'To',
  Subject = 'Subject',
  Body = 'Body',
  Send = 'Send'
}

interface ActionTo<T extends string> {
  type: Types.To
  payload: T
}

interface ActionSubject<T extends string> {
  type: Types.Subject
  payload: T
}

interface ActionBody<T extends string> {
  type: Types.Body
  payload: T
}

interface ActionSend {
  type: Types.Send
  payload: true
}

export interface State {
  to?: string
  subject?: string
  body?: string
  sent: boolean
}

export interface Email<T> {
  model: T

  to<U extends string>(payload: U): Next<Settings, T, ActionTo<U>>

  subject<U extends string>(payload: U): Next<Settings, T, ActionSubject<U>>

  send(): Next<Settings, T, ActionSend>

  body<U extends string>(payload: U): Next<Settings, T, ActionBody<U>>
}

export interface Category<
  _T,
  T extends Model<State> = TL.Cast<_T, Model<State>>
> {
  [Types.To]: {
    [Options.TYPE]: Types.To
    [Options.ONCE]: TL.True
    [Options.DEPENDENCIES]: never
    [Options.KEYS]: 'to'
    [Options.ENABLED]: TL.True
    [Options.CONFLICTS]: never
  }

  [Types.Subject]: {
    [Options.TYPE]: Types.Subject
    [Options.ONCE]: TL.True
    [Options.DEPENDENCIES]: Types.To
    [Options.KEYS]: 'subject'
    [Options.ENABLED]: TL.True
    [Options.CONFLICTS]: never
  }

  [Types.Body]: {
    [Options.TYPE]: Types.Body
    [Options.ONCE]: TL.True
    [Options.DEPENDENCIES]: Types.To | Types.Subject
    [Options.KEYS]: 'body'
    [Options.ENABLED]: TL.True
    [Options.CONFLICTS]: never
  }

  [Types.Send]: {
    [Options.TYPE]: Types.Send
    [Options.ONCE]: TL.True
    [Options.DEPENDENCIES]: never
    [Options.KEYS]: 'send'
    [Options.ENABLED]: TL.Equal<TL.Widen<T['state']['body']>, string>
    [Options.CONFLICTS]: never
  }
}

export interface Reducer<
  _T,
  T extends Action = TL.Cast<_T, Action>,
> {
  [Types.To]: { to: Payload<T, Types.To> }
  [Types.Subject]: { subject: Payload<T, Types.Subject> }
  [Types.Body]: { body: Payload<T, Types.Body> }
  [Types.Send]: { sent: Payload<T, Types.Send> }
}

export interface INITIAL_STATE {
  sent: false
}

export interface Settings {
  [Options.INTERFACE]: typeof EMAIL_INTERFACE
  [Options.CATEGORY]: typeof EMAIL_CATEGORY
  [Options.REDUCER]: typeof EMAIL_REDUCER
  [Options.INITIAL_STATE]: INITIAL_STATE
  [Options.STATE]: State
}

export declare const email: () => Next<Settings>

declare module '@escapace/typelevel/hkt' {
  interface URI2HKT<A> {
    [EMAIL_INTERFACE]: Email<A>
    [EMAIL_CATEGORY]: Category<A>
    [EMAIL_REDUCER]: Reducer<A>
  }
}
