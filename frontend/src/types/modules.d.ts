// Typdeklarationen für externe Module

declare module 'axios' {
  interface AxiosRequestConfig {
    headers?: Record<string, string>;
    baseURL?: string;
    params?: any;
  }

  interface InternalAxiosRequestConfig extends AxiosRequestConfig {
    headers: Record<string, string>;
  }

  interface AxiosResponse<T = any> {
    data: T;
    status: number;
    statusText: string;
    headers: Record<string, string>;
    config: AxiosRequestConfig;
  }

  interface AxiosError<T = any> extends Error {
    config: AxiosRequestConfig;
    code?: string;
    request?: any;
    response?: AxiosResponse<T>;
    isAxiosError: boolean;
  }

  interface AxiosInstance {
    (config: AxiosRequestConfig): Promise<AxiosResponse>;
    (url: string, config?: AxiosRequestConfig): Promise<AxiosResponse>;
    defaults: AxiosRequestConfig;
    interceptors: {
      request: AxiosInterceptorManager<AxiosRequestConfig>;
      response: AxiosInterceptorManager<AxiosResponse>;
    };
    get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    post<T = any>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    put<T = any>(url: string, data: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
    delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>>;
  }

  interface AxiosInterceptorManager<V> {
    use(onFulfilled?: (value: V) => V | Promise<V>, onRejected?: (error: any) => any): number;
    eject(id: number): void;
  }

  function create(config?: AxiosRequestConfig): AxiosInstance;

  const axios: AxiosInstance & {
    create: typeof create;
    CancelToken: any;
    isCancel: (value: any) => boolean;
    all: <T>(values: (T | Promise<T>)[]) => Promise<T[]>;
    spread: <T, R>(callback: (...args: T[]) => R) => (array: T[]) => R;
  };

  export default axios;
}

declare module '@reduxjs/toolkit' {
  import { Reducer } from 'redux';

  export interface PayloadAction<P = void, T extends string = string, M = never, E = never> {
    payload: P;
    type: T;
    meta?: M;
    error?: E;
  }

  export interface ActionCreatorWithPayload<P, T extends string = string> {
    (payload: P): PayloadAction<P, T>;
    type: T;
  }

  export interface ActionCreatorWithoutPayload<T extends string = string> {
    (): PayloadAction<void, T>;
    type: T;
  }

  export type ActionCreator<P = void, T extends string = string> = 
    P extends void ? ActionCreatorWithoutPayload<T> : ActionCreatorWithPayload<P, T>;

  export interface SliceCaseReducers<State> {
    [key: string]: (state: State, action: PayloadAction<any>) => State | void;
  }

  export interface CreateSliceOptions<
    State,
    CR extends SliceCaseReducers<State>,
    Name extends string = string
  > {
    name: Name;
    initialState: State;
    reducers: CR;
    extraReducers?: any;
  }

  export interface Slice<
    State,
    CaseReducers extends SliceCaseReducers<State>,
    Name extends string = string
  > {
    name: Name;
    reducer: Reducer<State>;
    actions: { [K in keyof CaseReducers]: ActionCreator<any> };
    caseReducers: CaseReducers;
  }

  export function createSlice<State, CR extends SliceCaseReducers<State>, Name extends string = string>(
    options: CreateSliceOptions<State, CR, Name>
  ): Slice<State, CR, Name>;

  export function configureStore(options: any): any;

  export function createAsyncThunk<ReturnType, ArgType = void>(
    typePrefix: string,
    payloadCreator: (arg: ArgType, thunkAPI: any) => Promise<ReturnType>,
    options?: any
  ): any & {
    pending: string;
    fulfilled: string;
    rejected: string;
  };
}

declare module 'react' {
  namespace React {
    interface ReactElement<P = any, T extends string | JSXElementConstructor<any> = string | JSXElementConstructor<any>> {
      type: T;
      props: P;
      key: Key | null;
    }
    
    type Key = string | number;
    
    type JSXElementConstructor<P> = 
      | ((props: P) => ReactElement<any, any> | null)
      | (new (props: P) => Component<any, any>);
    
    class Component<P, S> {
      constructor(props: P);
      props: P;
      state: S;
      setState(state: S | ((prevState: S, props: P) => S)): void;
      render(): ReactElement | null;
    }
  }
  
  export interface FC<P = {}> {
    (props: P): React.ReactElement | null;
  }
  
  export type ReactNode = 
    | React.ReactElement
    | string
    | number
    | boolean
    | null
    | undefined
    | React.ReactNodeArray;
  
  export type ReactNodeArray = ReactNode[];
  
  export function useState<T>(initialState: T | (() => T)): [T, (newState: T | ((prevState: T) => T)) => void];
  export function useEffect(effect: () => void | (() => void), deps?: readonly any[]): void;
  
  export default React;
}

declare module 'react/jsx-runtime' {
  export namespace JSX {
    interface Element extends React.ReactElement<any, any> {}
    interface IntrinsicElements {
      [elemName: string]: any;
    }
  }
  
  export function jsx(type: any, props: any): JSX.Element;
  export function jsxs(type: any, props: any): JSX.Element;
}

declare module 'react-redux' {
  export function useDispatch<T = any>(): T;
  export function useSelector<T = any, R = any>(selector: (state: T) => R): R;
}

declare module 'react-hook-form' {
  export function useForm<T = any>(options?: any): {
    register: (name: string, options?: any) => any;
    handleSubmit: (onSubmit: (data: T) => void) => (event: any) => void;
    formState: {
      errors: Record<string, { message?: string }>;
    };
    watch: (name: string, defaultValue?: any) => any;
    reset: (values?: any) => void;
  };
}

declare module '@mui/material' {
  export const TextField: React.FC<any>;
  export const Button: React.FC<any>;
  export const Box: React.FC<any>;
  export const Typography: React.FC<any>;
  export const CircularProgress: React.FC<any>;
  export const Paper: React.FC<any>;
  export const Avatar: React.FC<any>;
}
