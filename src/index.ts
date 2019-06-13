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

export type Types<T extends Settings> = keyof $.Type<T[Options.Category], Model>

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
  [Options.InitialState]?: Partial<T[Options.State]>
  [Options.Reducer]?: (log: Action<U>[]) => Partial<T[Options.State]>
}

import {
  assign,
  compact,
  defaults,
  differenceWith,
  every,
  flatten,
  forEach,
  isBoolean,
  isFunction,
  isNumber,
  isPlainObject,
  isString,
  isSymbol,
  isUndefined,
  map,
  omit,
  some,
  union
} from 'lodash'

export const SYMBOL_LOG = Symbol.for('ESCAPACE_FLUENT_LOG')
export const SYMBOL_STATE = Symbol.for('ESCAPACE_FLUENT_STATE')

export interface FluentInterface<T extends Model> {
  readonly [SYMBOL_LOG]: T extends Model<any, infer U> ? Array<U> : []
  readonly [SYMBOL_STATE]: T extends Model<infer U> ? U : {}
}

export const log = <T>(fluent: { [SYMBOL_LOG]: T }): T => fluent[SYMBOL_LOG]
export const state = <T>(fluent: { [SYMBOL_STATE]: T }): T =>
  fluent[SYMBOL_STATE]

const isType = <T extends number | string | symbol>(value: T): boolean =>
  isString(value) || isNumber(value) || isSymbol(value)

const normalize = <T extends Settings>(
  records: Plugin<Types<T>, T>[]
): Required<Plugin<Types<T>, T>>[] =>
  map(records, record =>
    defaults(record, {
      [Options.Keys]: [],
      [Options.Dependencies]: [],
      [Options.Enabled]: () => true,
      [Options.Conflicts]: [],
      [Options.InitialState]: {},
      [Options.Reducer]: () => ({})
    })
  )

interface LocalState<T extends Settings> {
  records: Required<Plugin<Types<T>, T>>[]
  initialState: {}
  state: {}
  log: Action[]
}

class Lens<T extends Settings> {
  private readonly state: LocalState<T> = {
    records: [],
    initialState: {},
    state: {},
    log: []
  }

  public dispatch(action?: Action, ...plugins: Plugin<Types<T>, T>[]) {
    if (plugins.length !== 0) {
      this.register(plugins)
    }

    if (!isUndefined(action)) {
      this.state.log.unshift(action)
    }

    this.setState()

    return this.interfaces()
  }

  public register(records: Plugin<Types<T>, T>[]) {
    const newRecords: Required<Plugin<Types<T>, T>>[] = normalize(records)

    this.setRecords(newRecords)

    this.state.initialState = assign(
      {},
      ...map(this.state.records, record => record[Options.InitialState])
    )
  }

  private setState() {
    this.state.state = assign(
      {},
      this.state.initialState,
      ...map(this.state.records, record =>
        record[Options.Reducer](this.state.log)
      )
    )
  }

  private interfaces() {
    const combinedInterfaces: {} = assign(
      {
        [SYMBOL_LOG]: this.state.log,
        [SYMBOL_STATE]: this.state.state
      },
      ...map(this.state.records, record =>
        record[Options.Interface](this.dispatch.bind(this))
      )
    )

    const keys = flatten(
      compact(
        map(this.state.records, record => {
          const once = record[Options.Once]
            ? !some(
                this.state.log,
                action => action.type === record[Options.Type]
              )
            : true

          const enabled = record[Options.Enabled](
            this.state.log,
            this.state.state
          )

          const conflicts = !some(record[Options.Conflicts], type =>
            some(this.state.log, action => action.type === type)
          )

          const dependencies = every(record[Options.Dependencies], type =>
            some(this.state.log, action => action.type === type)
          )

          return enabled && conflicts && dependencies && once
            ? undefined
            : record[Options.Keys]
        })
      )
    )

    return omit(combinedInterfaces, keys)
  }

  private setRecords(records: Required<Plugin<Types<T>, T>>[]) {
    forEach(records, record => {
      if (!isType(record[Options.Type])) {
        throw new Error(`${record[Options.Type]} is not valid [Options.Type]`)
      }

      if (!isBoolean(record[Options.Once])) {
        throw new Error(`${record[Options.Type]} is not valid [Options.Once]`)
      }

      if (!every(record[Options.Dependencies], isType)) {
        throw new Error(
          `${record[Options.Dependencies]} is not valid [Options.Dependencies]`
        )
      }

      if (!every(record[Options.Conflicts], isType)) {
        throw new Error(
          `${record[Options.Dependencies]} is not valid [Options.Conflicts]`
        )
      }

      if (!isFunction(record[Options.Enabled])) {
        throw new Error(
          `${record[Options.Enabled]} is not valid [Options.Enabled]`
        )
      }

      if (!isFunction(record[Options.Reducer])) {
        throw new Error(
          `${record[Options.Reducer]} is not valid [Options.Reducer]`
        )
      }

      if (!isPlainObject(record[Options.InitialState])) {
        throw new Error(
          `${record[Options.InitialState]} is not valid [Options.InitialState]`
        )
      }
    })

    const filteredRecords = differenceWith(
      this.state.records,
      records,
      (a, b) => a[Options.Type] === b[Options.Type]
    )

    this.state.records = union(filteredRecords, records)
  }
}

// tslint:disable-next-line: max-func-body-length
export const builder = <T extends Settings>(
  value: Plugin<Types<T>, T>[]
): (() => Next<T>) => {
  return () => {
    const lens = new Lens<T>()
    lens.register(value)

    return lens.dispatch() as Next<T>
  }
}
