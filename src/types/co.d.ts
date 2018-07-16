declare function co <R> (fn: () => co.Result<R>): Promise<R>;
declare function co <T, R> (fn: (arg: T) => co.Result<R>): Promise<R>;
declare function co <T1, T2, R> (fn: (arg1: T1, arg2: T2) => co.Result<R>): Promise<R>;
declare function co <T1, T2, T3, R> (fn: (arg1: T1, arg2: T2, arg3: T3) => co.Result<R>): Promise<R>;
declare function co <T1, T2, T3, T4, R> (fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => co.Result<R>): Promise<R>;
declare function co <T1, T2, T3, T4, T5, R> (fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => co.Result<R>): Promise<R>;
declare function co <T, R> (fn: (...args: T[]) => co.Result<R>): Promise<R>;

declare namespace co {
  export function wrap <R> (fn: () => Result<R>): () => Promise<R>;
  export function wrap <T, R> (fn: (arg: T) => Result<R>): (arg: T) => Promise<R>;
  export function wrap <T1, T2, R> (fn: (arg1: T1, arg2: T2) => Result<R>): (arg1: T1, arg2: T2) => Promise<R>;
  export function wrap <T1, T2, T3, R> (fn: (arg1: T1, arg2: T2, arg3: T3) => Result<R>): (arg1: T1, arg2: T2, arg3: T3) => Promise<R>;
  export function wrap <T1, T2, T3, T4, R> (fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Result<R>): (arg1: T1, arg2: T2, arg3: T3, arg4: T4) => Promise<R>;
  export function wrap <T1, T2, T3, T4, T5, R> (fn: (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Result<R>): (arg1: T1, arg2: T2, arg3: T3, arg4: T4, arg5: T5) => Promise<R>;
  export function wrap <T, R> (fn: (...args: T[]) => Result<R>): Promise<R>;

  export interface ArrayResult <T> extends Array<Yieldable<T>> {}
  export interface ObjectResult <T> { [key: string]: Yieldable<T> }
  export type Yieldable <T> = PromiseLike<T> | ((err: Error, res: T) => any) | ((...args: any[]) => IterableIterator<T> | IterableIterator<T>) | T;
  export type Result <T> = IterableIterator<ArrayResult<T> | ObjectResult<T> | Yieldable<T>>;
}

export = co;