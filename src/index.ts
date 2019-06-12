/* tslint:disable completed-docs no-any no-unsafe-any */

import $ from '@escapace/typelevel'

export interface Action<T extends string | number | symbol = any, U = any> {
  type: T
  payload: U
}

export interface Model<U extends {} = any, T extends Action = any> {
  log: T
  state: U
}

export enum Options {
  Type,
  State,
  Reducer,
  Once,
  Keys,
  Interface,
  InitialState,
  Enabled,
  Dependencies,
  Conflicts,
  Category
}

export interface Settings {
  [Options.Interface]: $.URIS
  [Options.Category]: $.URIS
  [Options.Reducer]: $.URIS
  [Options.InitialState]: {}
  [Options.State]: {}
}

export interface Specification {
  [Options.Type]: Action['type']
  [Options.Once]: $.True | $.False
  [Options.Dependencies]: Action['type']
  [Options.Keys]: string
  [Options.Enabled]: $.True | $.False
  [Options.Conflicts]: Action['type']
}

export type Check<T extends Model, S> = S extends Specification
  ? T['log'] extends { type: infer X }
    ? $.If<
        $.Equal<
          | S[Options.Enabled]
          | $.If<
              $.Or<$.Not<S[Options.Once]>, $.Is.Unknown<X>>,
              $.True,
              $.Not<$.Contains<X, S[Options.Type]>>
            >
          | $.If<
              $.Is.Never<S[Options.Dependencies]>,
              $.True,
              $.If<
                $.Is.Unknown<X>,
                $.False,
                $.Contains<X, S[Options.Dependencies]>
              >
            >
          | $.If<
              $.Or<$.Is.Never<S[Options.Conflicts]>, $.Is.Unknown<X>>,
              $.True,
              $.Not<$.Contains<X, S[Options.Conflicts]>>
            >,
          $.True
        >,
        never,
        S[Options.Keys]
      >
    : never
  : never

type Fluent<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P]
}

export type Instance<S extends Settings, T extends Model> = Fluent<
  $.Type<S[Options.Interface], T>,
  Check<T, $.Properties<$.Type<S[Options.Category], T>>>
>

export type Reducer<T extends Settings, U extends Action> = $.Assign<
  T[Options.InitialState],
  $.Cast<
    $.To.Intersection<
      $.Properties<$.Type<T[Options.Reducer], U>, U['type'], {}>
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
> = Log<S, $.If<$.Is.Never<T['log']>, U, U | T['log']>>
//  extends Model<infer C1, infer C2>
//   ? Model<C1, C2>
//   : never

export type Next<
  S extends Settings,
  T = { log: never; state: never },
  U extends Action = never
> = Instance<S, NextModel<S, U, $.Cast<T, Model>>>

export type Payload<
  T extends Action,
  U extends T['type'],
  E = never
> = T extends Action<U, infer P> ? P : E

export type Types<T extends Settings> = keyof $.Type<
  T[Options.Category],
  Model
>

export interface Plugin<
  Z extends Types<T>,
  T extends Settings,
  U extends string | number | symbol = Types<T>
> {
  [Options.Type]: Z
  [Options.Once]: boolean
  [Options.Interface]: (
    dispatch: <A extends Action<U>, B extends Types<T> = Types<T>>(
      action: A,
      ...plugins: Plugin<B, T>[]
    ) => void
  ) => {}
  [Options.Keys]?: Array<string | number | symbol>
  [Options.Dependencies]?: U[]
  [Options.Enabled]?: (log: Action<U>[], state: T[Options.State]) => boolean
  [Options.Conflicts]?: U[]
  [Options.State]?: Partial<T[Options.State]>
  [Options.Reducer]?: (log: Action<U>[]) => Partial<T[Options.State]>
}

// export type Builder<T extends Settings> = (value: Record<Types<T>, Plugin<T>>) => Next<T>

import {
  assign,
  compact,
  defaults,
  every,
  flatten,
  map,
  omit,
  some
} from 'lodash'

export const SYMBOL_LOG = Symbol.for('ESCAPACE_FLUENT_LOG')
export const SYMBOL_STATE = Symbol.for('ESCAPACE_FLUENT_STATE')

export interface FluentInterface<T extends Model> {
  readonly [SYMBOL_LOG]: T extends Model<any, infer U> ? Array<U> : []
  readonly [SYMBOL_STATE]: T extends Model<infer U> ? U : {}
}

export const log = <T>(fluent: { [SYMBOL_LOG]: T }): T => fluent[SYMBOL_LOG]
export const state = <T>(fluent: { [SYMBOL_STATE]: T }): T => fluent[SYMBOL_STATE]

export const builder = <T extends Settings>(
  records: Plugin<Types<T>, T>[]
): (() => Next<T>) => {
  return () => {
    const normalize = (r: any) =>
      map(r, record =>
        defaults(record, {
          [Options.Keys]: [],
          [Options.Dependencies]: [],
          [Options.Enabled]: () => true,
          [Options.Conflicts]: [],
          [Options.State]: {},
          [Options.Reducer]: () => ({})
        })
      )

    const _records = normalize(records)

    const initialState = assign(
      {},
      ...map(_records, record => record[Options.State])
    )

    const log: Action[] = []

    const start = () => {
      // tslint:disable-next-line: no-use-before-declare
      const state = assign(
        {},
        initialState,
        ...map(_records, record => record[Options.Reducer](log))
      )
      const interfaces = assign(
        {
          [SYMBOL_LOG]: log,
          [SYMBOL_STATE]: state
        },
        // tslint:disable-next-line: no-use-before-declare
        ...map(_records, record => record[Options.Interface](dispatch))
      )

      const keys = flatten(
        compact(
          map(_records, record => {
            // const focus = pick(record, [Options.Enabled, Options.Conflicts, Options.Dependencies])

            const once = record[Options.Once]
              ? !some(log, action => action.type === record[Options.Type])
              : true
            const enabled = record[Options.Enabled](log, state)
            const conflicts = !some(record[Options.Conflicts], type =>
              some(log, action => action.type === type)
            )
            const dependencies = every(record[Options.Dependencies], type =>
              some(log, action => action.type === type)
            )

            return enabled && conflicts && dependencies && once
              ? undefined
              : record[Options.Keys]
          })
        )
      )

      return omit(interfaces, keys)
    }

    const dispatch = (action: Action, ...plugins: Plugin<Types<T>, T>[]) => {
      if (plugins.length !== 0) {
        _records.push(...normalize(plugins))
      }

      // console.log(records)

      log.unshift(action)

      return start()
    }

    return start() as Next<T>
  }
}
