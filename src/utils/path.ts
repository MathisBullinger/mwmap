export const pick = (root: Object, ...path: string[]) =>
  path.length === 0 ? root : pick(root?.[path[0]], ...path.slice(1))

export const assign = <T extends any>(
  root: Object,
  path: string[],
  value: T
): T => (pick(root, ...path.slice(0, -1))[path[path.length - 1]] = value)
