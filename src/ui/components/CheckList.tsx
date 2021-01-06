import React, { useState, useRef, useEffect } from 'react'
import styled from 'styled-components'

const build = (v: React.ReactNode, idPrefix: string, initial: string[]) => {
  if (Array.isArray(v)) return v.map(c => build(c, idPrefix, initial))
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
    list = <ol>{children.map(v => build(v, idPrefix, initial))}</ol>
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
      <S.Check
        data-key={key}
        type="checkbox"
        id={idPrefix + key}
        defaultChecked={initial.includes(key)}
      />
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
      Array.from(children).map(v => (v.indeterminate ? 2 : v.checked ? 1 : 0))
    )
    if (childStates.size > 1 || childStates.has(2)) {
      parent.checked = false
      parent.indeterminate = true
    } else {
      parent.checked = childStates.has(1)
      parent.indeterminate = false
    }
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
  initial?: string[]
}

const CheckList: React.FC<Props> = ({ children, onChange, initial }) => {
  const [idPrefix] = useState(((Math.random() * 1e9) | 0).toString(16) + '-')
  const items: JSX.Element[] = []
  const ref = useRef<HTMLOListElement>(null)

  useEffect(() => {
    if (!ref.current) return
    Array.from(
      ref.current.querySelectorAll<HTMLInputElement>("input[type='checkbox']")
    )
      .map(node => {
        node.parentElement
          ?.querySelectorAll<HTMLInputElement>("input[type='checkbox']")
          .forEach(input => {
            if (initial?.includes(input.dataset.key!)) return
            input.checked = node.checked
          })
        return node
      })
      .filter(v => !v.parentElement!.querySelector('ol'))
      .forEach(node => {
        propagateUp(node)
      })
  }, [ref.current])

  React.Children.forEach(children, v => {
    const item = build(v, idPrefix, initial ?? [])
    if (item) items.push(item)
  })
  return (
    <S.List
      ref={ref}
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
          ?.querySelectorAll<HTMLInputElement>(
            ":scope > ol input[type='checkbox']"
          )
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
    white-space: pre;

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
