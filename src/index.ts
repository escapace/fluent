import type $ from '@escapace/typelevel'

import {
  isBoolean,
  isFunction,
  isNumber,
  isPlainObject,
  isString,
  isSymbol
} from 'lodash-es'

export interface Action<T extends number | string | symbol = any, U = any> {
  payload: U
  type: T
}

export interface Model<U extends {} = any, T extends Action[] = any> {
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
  [Options.InitialState]: {}
  [Options.Interface]: $.URIS
  [Options.Reducer]: $.URIS
  [Options.Specification]: $.URIS
  [Options.State]: {}
}

export interface Specification {
  [Options.Conflicts]: Action['type']
  [Options.Dependencies]: Action['type']
  [Options.Enabled]: $.False | $.True
  [Options.Keys]: string
  [Options.Once]: $.False | $.True
  [Options.Type]: Action['type']
}

export type Check<T extends Model, S> = S extends Specification
  ? T['log'] extends Array<{ type: infer X }>
    ? $.If<
        $.Equal<
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
            >
          | $.If<
              $.Or<$.Not<S[Options.Once]>, $.Is.Unknown<X>>,
              $.True,
              $.Not<$.Contains<X, S[Options.Type]>>
            >
          | S[Options.Enabled],
          $.True
        >,
        never,
        S[Options.Keys]
      >
    : never
  : never

export type Fluent<T, K extends number | string | symbol> = {
  [P in Exclude<keyof T, K>]: T[P]
}

export type Instance<S extends Settings, T extends Model> = Fluent<
  $.Type<S[Options.Interface], T>,
  Check<T, $.Properties<$.Type<S[Options.Specification], T>>>
>

export type Reducer<T extends Settings, U extends Action[]> = $.Assign<
  T[Options.InitialState],
  $.Cast<
    $.To.Intersection<
      $.Properties<$.Type<T[Options.Reducer], U>, $.Values<U>['type'], {}>
    >,
    {}
  >
>

export interface Log<T extends Settings, U extends Action[]> {
  log: U
  state: Reducer<T, U>
}

export type Next<
  S extends Settings,
  T extends Model = { log: never; state: never },
  U extends Action = never
> = Instance<
  S,
  Log<S, $.If<$.Is.Never<$.Values<T['log']>>, [U], [U, ...T['log']]>>
>

export type Payload<T extends Action, U extends T['type'], E = never> =
  T extends Action<U, infer P> ? P : E

export type Types<T extends Settings> = keyof $.Type<
  T[Options.Specification],
  Model
>

export interface Plugin<
  Z extends Types<T>,
  T extends Settings,
  U extends number | string | symbol = Types<T>
> {
  [Options.Conflicts]?: U[]
  [Options.Dependencies]?:
    | ((log: Array<Action<U>>, state: T[Options.State]) => U[])
    | U[]
  [Options.Enabled]?: (
    log: Array<Action<U>>,
    state: T[Options.State]
  ) => boolean
  [Options.InitialState]?: Partial<T[Options.State]>
  [Options.Interface]: (
    dispatch: <A extends Action<U>, B extends Types<T> = Types<T>>(
      action: A,
      ...plugins: Array<Plugin<B, T>>
    ) => void,
    log: Array<Action<U>>,
    state: T[Options.State]
  ) => {}
  [Options.Keys]?: Array<number | string | symbol>
  [Options.Once]: boolean
  [Options.Reducer]?: (log: Array<Action<U>>) => Partial<T[Options.State]>
  [Options.Type]: Z
}

export const SYMBOL_LOG = Symbol.for('ESCAPACE_FLUENT_LOG')
export const SYMBOL_STATE = Symbol.for('ESCAPACE_FLUENT_STATE')

export interface FluentInterface<T extends Model> {
  readonly [SYMBOL_LOG]: T extends Model<any, infer U> ? U : []
  readonly [SYMBOL_STATE]: T extends Model<infer U> ? U : {}
}

export const log = <T>(fluent: { [SYMBOL_LOG]: T }): T => fluent[SYMBOL_LOG]
export const state = <T>(fluent: { [SYMBOL_STATE]: T }): T =>
  fluent[SYMBOL_STATE]

const isType = <T extends number | string | symbol>(value: T): boolean =>
  isString(value) || isNumber(value) || isSymbol(value)

const every = <T>(collection: T[], predicate: (value: T) => boolean): boolean =>
  collection.filter(predicate).length === collection.length

const some = <T>(
  collection: T[],
  predicate: (value: T) => boolean
): boolean => {
  let current = 0

  while (current < collection.length) {
    if (predicate(collection[current])) {
      return true
    }

    ++current
  }

  return false
}

const normalize = <T extends Settings>(
  records: Array<Plugin<Types<T>, T>>
): Array<Required<Plugin<Types<T>, T>>> =>
  records.map((record) => ({
    [Options.Conflicts]: [],
    [Options.Dependencies]: [],
    [Options.Enabled]: () => true,
    [Options.InitialState]: {},
    [Options.Keys]: [],
    [Options.Reducer]: () => ({}),
    ...record
  }))

interface LocalState<T extends Settings> {
  initialState: {}
  log: Action[]
  records: Array<Required<Plugin<Types<T>, T>>>
  reducers: Array<Required<Plugin<Types<T>, T>>[Options.Reducer]>
  state: {}
}

const normalizeRecords = <T extends Settings>(
  value: Array<Plugin<Types<T>, T>>
): Array<Required<Plugin<Types<T>, T>>> => {
  const records: Array<Required<Plugin<Types<T>, T>>> = normalize(value)

  records.forEach((record) => {
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
        (Array.isArray(record[Options.Dependencies]) &&
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

const tests = <T extends Settings>(
  state: LocalState<T>,
  record: Required<Plugin<Types<T>, T>>
): Array<() => boolean> => [
  () =>
    every(
      isFunction(record[Options.Dependencies])
        ? (record[Options.Dependencies] as Function)(state.log, state.state)
        : record[Options.Dependencies],
      (type) => some(state.log, (action) => action.type === type)
    ),
  () => record[Options.Enabled](state.log, state.state),
  () =>
    record[Options.Once]
      ? !some(state.log, (action) => action.type === record[Options.Type])
      : true,
  () =>
    !some(record[Options.Conflicts], (type) =>
      some(state.log, (action) => action.type === type)
    )
]

const interfaces = <T extends Settings>(state: LocalState<T>): {} => {
  const disabled = state.records.filter(
    (record) =>
      !tests(state, record).reduce<boolean>(
        (previous, current) => (previous ? current() : false),
        true
      )
  )

  const enabled = state.records.filter((record) => !disabled.includes(record))

  const keys: Array<number | string | symbol> = disabled.reduce(
    (previous: Array<number | string | symbol>, record) => {
      return previous.concat(record[Options.Keys])
    },
    []
  )

  const combinedInterfaces = Object.assign(
    {
      [SYMBOL_LOG]: state.log,
      [SYMBOL_STATE]: state.state
    },
    ...enabled.map((record) =>
      record[Options.Interface](dispatchFactory(state), state.log, state.state)
    )
  )

  Object.keys(combinedInterfaces)
    .filter((key) => keys.includes(key))
    .forEach((key) => {
      // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
      delete combinedInterfaces[key]
    })

  return combinedInterfaces
}

const dispatchFactory = <T extends Settings>(_state: LocalState<T>) => {
  return (action?: Action, ...plugins: Array<Plugin<Types<T>, T>>) => {
    const state =
      plugins.length !== 0
        ? register(normalizeRecords(plugins), { ..._state })
        : { ..._state }

    if (action !== undefined) {
      if (isPlainObject(action) && isType(action.type)) {
        state.log = [action, ...state.log]
      } else {
        throw new Error(`Invalid FSA type`)
      }
    }

    state.state = Object.assign(
      {},
      state.initialState,
      ...state.reducers.map((reducer) => reducer(state.log))
    )

    return interfaces(state)
  }
}

const register = <T extends Settings>(
  records: Array<Required<Plugin<Types<T>, T>>>,
  state: LocalState<T>
): LocalState<T> => {
  records.forEach((record) => {
    state.records = [...state.records, record]

    if (!state.reducers.includes(record[Options.Reducer])) {
      state.reducers = [...state.reducers, record[Options.Reducer]]
    }
  })

  state.initialState = Object.assign(
    {},
    ...state.records.map((record) => record[Options.InitialState])
  )

  return state
}

const initialLocalStateFactory = <T extends Settings>(): LocalState<T> => ({
  initialState: {},
  log: [],
  records: [],
  reducers: [],
  state: {}
})

export const builder = <T extends Settings>(
  value: Array<Plugin<Types<T>, T>>
): (() => Next<T>) => {
  const normalized = normalizeRecords(value)

  return () => {
    return dispatchFactory(
      register(normalized, initialLocalStateFactory())
    )() as unknown as Next<T>
  }
}
