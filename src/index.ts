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
  Specification
}

export interface Settings {
  [Options.Interface]: $.URIS
  [Options.Specification]: $.URIS
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
              $.Not<$.Has<X, S[Options.Conflicts]>>
            >,
          $.True
        >,
        never,
        S[Options.Keys]
      >
    : never
  : never

export type Fluent<T, K extends string | number | symbol> = {
  [P in Exclude<keyof T, K>]: T[P]
}

export type Instance<S extends Settings, T extends Model> = Fluent<
  $.Type<S[Options.Interface], T>,
  Check<T, $.Properties<$.Type<S[Options.Specification], T>>>
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
  T[Options.Specification],
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
    ) => void,
    log: Action<U>[],
    state: T[Options.State]
  ) => {}
  [Options.Keys]?: Array<string | number | symbol>
  [Options.Dependencies]?:
    | U[]
    | ((log: Action<U>[], state: T[Options.State]) => U[])
  [Options.Enabled]?: (log: Action<U>[], state: T[Options.State]) => boolean
  [Options.Conflicts]?: U[]
  [Options.InitialState]?: Partial<T[Options.State]>
  [Options.Reducer]?: (log: Action<U>[]) => Partial<T[Options.State]>
}

import {
  isArray,
  isBoolean,
  isFunction,
  isNumber,
  isPlainObject,
  isString,
  isSymbol,
  isUndefined
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

const every = <T>(
  collection: Array<T>,
  predicate: (value: T) => boolean
): boolean => collection.filter(predicate).length === collection.length

const some = <T>(
  collection: Array<T>,
  predicate: (value: T) => boolean
): boolean => {
  let current: number = 0

  while (current < collection.length) {
    if (predicate(collection[current])) {
      return true
    }

    // tslint:disable-next-line: increment-decrement
    ++current
  }

  return false
}

const normalize = <T extends Settings>(
  records: Plugin<Types<T>, T>[]
): Required<Plugin<Types<T>, T>>[] =>
  records.map(record => ({
    [Options.Keys]: [],
    [Options.Dependencies]: [],
    [Options.Enabled]: () => true,
    [Options.Conflicts]: [],
    [Options.InitialState]: {},
    [Options.Reducer]: () => ({}),
    ...record
  }))

interface LocalState<T extends Settings> {
  records: Array<Required<Plugin<Types<T>, T>>>
  reducers: Array<Required<Plugin<Types<T>, T>>[Options.Reducer]>
  initialState: {}
  state: {}
  log: Action[]
}

const normalizeRecords = <T extends Settings>(
  value: Plugin<Types<T>, T>[]
): Required<Plugin<Types<T>, T>>[] => {
  const records: Required<Plugin<Types<T>, T>>[] = normalize(value)

  records.forEach(record => {
    if (!isType(record[Options.Type])) {
      throw new Error('Not valid [Options.Type]')
    }

    if (!isBoolean(record[Options.Once])) {
      throw new Error(
        `Not valid [Options.Once] in the ${String(
          record[Options.Type]
        )} specification`
      )
    }

    if (
      !(
        isFunction(record[Options.Dependencies]) ||
        (isArray(record[Options.Dependencies]) &&
          every(
            record[Options.Dependencies] as Array<number | string | symbol>,
            isType
          ))
      )
    ) {
      throw new Error(
        `Not valid [Options.Dependencies] in the ${String(
          record[Options.Type]
        )} specification`
      )
    }

    if (!every(record[Options.Conflicts], isType)) {
      throw new Error(
        `Not valid [Options.Conflicts] in the ${String(
          record[Options.Type]
        )} specification`
      )
    }

    if (!isFunction(record[Options.Enabled])) {
      throw new Error(
        `Not valid [Options.Enabled] in the ${String(
          record[Options.Type]
        )} specification`
      )
    }

    if (!isFunction(record[Options.Reducer])) {
      throw new Error(
        `Not valid [Options.Reducer] in the ${String(
          record[Options.Type]
        )} specification`
      )
    }

    if (!isPlainObject(record[Options.InitialState])) {
      throw new Error(
        `Not valid [Options.InitialState] in the ${String(
          record[Options.Type]
        )} specification`
      )
    }
  })

  return records
}

class Lens<T extends Settings> {
  private readonly state: LocalState<T> = {
    records: [],
    reducers: [],
    initialState: {},
    state: {},
    log: []
  }

  public readonly dispatch = (
    action?: Action,
    ...plugins: Plugin<Types<T>, T>[]
  ) => {
    if (plugins.length !== 0) {
      this.register(normalizeRecords(plugins))
    }

    if (!isUndefined(action)) {
      if (isPlainObject(action) && isType(action.type)) {
        this.state.log.unshift(action)
      } else {
        throw new Error(`Invalid FSA type`)
      }
    }

    this.setState()

    return this.interfaces()
  }

  public readonly register = (records: Required<Plugin<Types<T>, T>>[]) => {
    this.setRecords(records)

    this.state.initialState = Object.assign(
      {},
      ...this.state.records.map(record => record[Options.InitialState])
    )
  }

  private readonly tests = (
    record: Required<Plugin<Types<T>, T>>
  ): Array<() => boolean> => [
    () =>
      every(
        isFunction(record[Options.Dependencies])
          ? (record[Options.Dependencies] as Function)(
              this.state.log,
              this.state.state
            )
          : record[Options.Dependencies],
        type => some(this.state.log, action => action.type === type)
      ),
    () => record[Options.Enabled](this.state.log, this.state.state),
    () =>
      record[Options.Once]
        ? !some(this.state.log, action => action.type === record[Options.Type])
        : true,
    () =>
      !some(record[Options.Conflicts], type =>
        some(this.state.log, action => action.type === type)
      )
  ]

  private setState() {
    this.state.state = Object.assign(
      {},
      this.state.initialState,
      ...this.state.reducers.map(reducer => reducer(this.state.log))
    )
  }

  private disabled(): Array<Required<Plugin<Types<T>, T>>> {
    return this.state.records.filter(
      record =>
        !this.tests(record).reduce(
          (prev, curr) => (prev ? curr() : false),
          true as boolean
        )
    )
  }

  // private enabled(): Array<Required<Plugin<Types<T>, T>>> {
  //   return this.state.records.filter(record =>
  //     this.disabled().indexOf(record) === -1
  //   )
  // }

  private interfaces(): {} {
    const keys: (string | number | symbol)[] = this.disabled().reduce(
      (prev: (string | number | symbol)[], record) => {
        return prev.concat(record[Options.Keys])
      },
      []
    )

    const combinedInterfaces = Object.assign(
      {
        [SYMBOL_LOG]: this.state.log,
        [SYMBOL_STATE]: this.state.state
      },
      ...this.state.records.map(record =>
        record[Options.Interface](
          this.dispatch,
          this.state.log,
          this.state.state
        )
      )
    )

    keys.forEach(key => {
      // tslint:disable-next-line: no-dynamic-delete
      delete combinedInterfaces[key]
    })

    return combinedInterfaces
  }

  private setRecords(records: Required<Plugin<Types<T>, T>>[]) {
    records.forEach(record => {
      this.state.records.push(record)

      if (this.state.reducers.indexOf(record[Options.Reducer]) === -1) {
        this.state.reducers.push(record[Options.Reducer])
      }
    })
  }
}

// tslint:disable-next-line: max-func-body-length
export const builder = <T extends Settings>(
  value: Plugin<Types<T>, T>[]
): (() => Next<T>) => {
  const normalized = normalizeRecords(value)

  return () => {
    const lens = new Lens<T>()

    lens.register(normalized)

    return (lens.dispatch() as unknown) as Next<T>
  }
}
