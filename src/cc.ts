import { Types } from './types'

import { TL } from '@escapace/typelevel'

import { Action, Model, Next, Options, Payload } from './lib'

interface ActionCC<T extends string> {
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

  export interface Email<T> {
    cc<U extends string>(payload: U): Next<Settings, T, ActionCC<U>>
  }

  export interface Reducer<
    _T,
    T extends Action = TL.Cast<_T, Action>,
  > {
    [Types.CC]: { cc: Array<Payload<T, Types.CC>> | undefined }
  }

  export interface Category<
    _T,
    T extends Model<State> = TL.Cast<_T, Model<State>>
  > {
    [Types.CC]: {
      [Options.TYPE]: Types.CC
      [Options.ONCE]: TL.False
      [Options.DEPENDENCIES]: Types.To
      [Options.KEYS]: 'cc'
      [Options.ENABLED]: TL.Contains<TL.Values<T['state']['plugins']>, Types.CC>
      [Options.CONFLICTS]: Types.Send
    }
  }
}
