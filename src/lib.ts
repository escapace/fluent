/* tslint:disable completed-docs */

import { TL } from '@escapace/typelevel'

export interface Action<T extends string | number = any, U = any> {
  type: T
  payload: U
}

export interface Model<U extends {} = any, T extends Action = any> {
  log: T
  state: U
}

export enum Options {
  TYPE,
  STATE,
  REDUCER,
  ONCE,
  KEYS,
  INTERFACE,
  INITIAL_STATE,
  ENABLED,
  DEPENDENCIES,
  CONFLICTS,
  CATEGORY
}

export interface Settings {
  [Options.INTERFACE]: TL.URIS
  [Options.CATEGORY]: TL.URIS
  [Options.REDUCER]: TL.URIS
  [Options.INITIAL_STATE]: {}
  [Options.STATE]: {}
}

export interface Specification {
  [Options.TYPE]: Action['type']
  [Options.ONCE]: TL.True | TL.False
  [Options.DEPENDENCIES]: Action['type']
  [Options.KEYS]: string
  [Options.ENABLED]: TL.True | TL.False
  [Options.CONFLICTS]: Action['type']
}

export type Check<T extends Model, S> = S extends Specification
  ? T['log'] extends { type: infer X }
    ? TL.If<
        TL.Equal<
          | S[Options.ENABLED]
          | TL.If<
              TL.Or<TL.Not<S[Options.ONCE]>, TL.Is.Unknown<X>>,
              TL.True,
              TL.Not<TL.Contains<X, S[Options.TYPE]>>
            >
          | TL.If<
              TL.Is.Never<S[Options.DEPENDENCIES]>,
              TL.True,
              TL.If<
                TL.Is.Unknown<X>,
                TL.False,
                TL.Contains<X, S[Options.DEPENDENCIES]>
              >
            >
          | TL.If<
              TL.Or<TL.Is.Never<S[Options.CONFLICTS]>, TL.Is.Unknown<X>>,
              TL.True,
              TL.Not<TL.Contains<X, S[Options.CONFLICTS]>>
            >,
          TL.True
        >,
        never,
        S[Options.KEYS]
      >
    : never
  : never


export type Instance<S extends Settings, T extends Model> = Omit<
  TL.Type<S[Options.INTERFACE], T>,
  Check<T, TL.Properties<TL.Type<S[Options.CATEGORY], T>>>
>

export type Reducer<T extends Settings, U extends Action> = TL.Assign<
  T[Options.INITIAL_STATE],
  TL.Cast<
    TL.To.Intersection<
      TL.Properties<TL.Type<T[Options.REDUCER], U>, U['type'], {}>
    >,
    {}
  >
>

export interface Log<T extends Settings, U extends Action> {
  log: U
  state: Reducer<T, U>
}

export type NextModel<
  S extends Settings,
  U extends Action,
  T extends Model
> = Log<
  S,
  TL.If<TL.Is.Never<T['log']>, U, U | T['log']>
>
//  extends Model<infer C1, infer C2>
//   ? Model<C1, C2>
//   : never

export type Next<
  S extends Settings,
  T = { log: never; state: never },
  U extends Action = never,
> = Instance<
  S,
  NextModel<S, U, TL.Cast<T, Model>>
>

export type Payload<
  T extends Action,
  U extends T['type'],
  E = never
> = T extends Action<U, infer P> ? P : E
