import { type InjectionKey, inject, provide } from 'vue';

export function useContext<T extends unknown[], R>(
  namespace: string,
  composable: (...args: T) => R
) {
  const key: InjectionKey<R> = Symbol(namespace) as InjectionKey<R>

  const useInject = (component?: string, defaultValue?: R): R => {
    const value = inject(key, defaultValue);

    if (component && !value) {
      throw new Error(`\`${component}\` must be used within \`${namespace}\``);
    }

    return value as R;
  };

  const useProvide = (...args: T): R => {
    const value = composable(...args);
    provide(key, value);
    return value;
  };

  return [useProvide, useInject] as const;
}
