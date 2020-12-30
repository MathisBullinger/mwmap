type ReactProps<T extends (...args: any[]) => JSX.Element> = Parameters<T>[0]
