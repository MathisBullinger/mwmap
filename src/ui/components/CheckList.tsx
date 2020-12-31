import React, { useState } from 'react'
import styled from 'styled-components'

const build = (v: React.ReactNode, idPrefix: string) => {
  if (typeof v !== 'object' || v === null || !('props' in v)) return
  const name =
    typeof v.props.children === 'string'
      ? v.props.children
      : (v.props.children as any[]).find(c => typeof c === 'string')
  if (!name) return
  const key = v.key ?? name.toLowerCase()
  let list: any = ''
  const children = v.props.children.filter?.(c => typeof c === 'object')
  if (children?.length) {
    list = <ol>{children.map(v => build(v, idPrefix))}</ol>
  }
  return (
    <S.Item
      key={key}
      role="treeitem"
      {...(typeof list !== 'string'
        ? {
            'data-type': 'tree',
            'aria-expanded': false,
            onClick(e) {
              e.stopPropagation()
              const node = e.target as HTMLElement
              if (node !== e.currentTarget) return
              node.setAttribute(
                'aria-expanded',
                node.getAttribute('aria-expanded') === 'true' ? 'false' : 'true'
              )
            },
          }
        : { 'data-type': 'term' })}
    >
      <label htmlFor={idPrefix + key}>{name}</label>
      <S.Check type="checkbox" id={idPrefix + key} />
      {list}
    </S.Item>
  )
}

const propagateUp = (node: HTMLInputElement): HTMLInputElement[] => {
  const parent = node.parentElement?.parentElement?.previousSibling
  if (!(parent instanceof HTMLInputElement)) return []
  const children = parent.nextElementSibling?.querySelectorAll<HTMLInputElement>(
    ":scope > li > input[type='checkbox']"
  )
  if (children?.length) {
    const childStates = new Set(
      Array.from(children).map(v => (v.indeterminate ? 3 : v.checked ? 1 : 2))
    )
    parent.indeterminate = childStates.size === 2
    if (childStates.size === 1) parent.checked = childStates.has(1)
  }
  return [parent, ...propagateUp(parent)]
}

const value = (node: HTMLInputElement): Value =>
  node.indeterminate ? 3 : node.checked ? 1 : 0

export enum EventType {
  DIRECT,
  PARENT,
  CHILD,
}

export enum Value {
  UNCHECKED,
  CHECKED,
  INDETERMINATE,
}

type Props = {
  onChange?(key: string, value: Value, type: EventType): void
}

const CheckList: React.FC<Props> = ({ children, onChange }) => {
  const [idPrefix] = useState(((Math.random() * 1e9) | 0).toString(16) + '-')
  const items: JSX.Element[] = []

  React.Children.forEach(children, v => {
    const item = build(v, idPrefix)
    if (item) items.push(item)
  })
  return (
    <S.List
      role="tree"
      onChange={({ target }) => {
        if (!(target instanceof HTMLInputElement)) return
        target.indeterminate = false
        onChange?.(
          target.id.slice(idPrefix.length),
          value(target),
          EventType.DIRECT
        )
        propagateUp(target).forEach(node => {
          onChange?.(
            node.id.slice(idPrefix.length),
            value(node),
            EventType.PARENT
          )
        })
        target.parentElement
          ?.querySelectorAll<HTMLInputElement>("input[type='checkbox']")
          .forEach(node => {
            node.checked = target.checked
            node.indeterminate = false
            onChange?.(
              node.id.slice(idPrefix.length),
              value(node),
              EventType.CHILD
            )
          })
      }}
    >
      {items}
    </S.List>
  )
}
export default CheckList

const S = {
  List: styled.ol`
    list-style: none;
    padding: 0;
    padding-left: 2ch;
    user-select: none;

    ol {
      list-style: none;
      padding-left: 1rem;
    }
  `,

  Item: styled.li`
    font-size: 1rem;
    min-height: 2rem;
    line-height: 2rem;

    &[aria-expanded='false'] > ol {
      display: none;
    }

    &[aria-expanded='false']::marker {
      content: '▸  ';
    }

    &[aria-expanded='true']::marker {
      content: '▾  ';
    }

    &[data-type='tree'][aria-expanded='false'] {
      cursor: s-resize;
    }

    &[data-type='tree'][aria-expanded='true'] {
      cursor: n-resize;
    }

    &[data-type='term']::marker {
      content: '';
    }

    label {
      cursor: pointer;
    }

    ol {
      cursor: initial;
    }
  `,

  Check: styled.input`
    position: absolute;
    right: 1rem;
    cursor: pointer;
  `,
}
