declare global {
  type Falsy = false | 0 | "" | null | undefined;
  type Maybe<T> = T | undefined;
}

declare module "react" {
  type FCC<Props = Record<string, unknown>> = React.FC<
    React.PropsWithChildren<Props>
  >;
}

export {};
