import React from 'react'
import styled from 'styled-components'
import Icon from './components/Icon'
import CheckList from './components/CheckList'
import store from 'src/map/store'
import filters, { Filter } from 'src/map/filters'
import { pick, assign } from 'src/utils/path'

const keyMap: Record<string, string[]> = {}

const build = <T extends Filter | Filter[string]>(
  v: T,
  ...keyPath: string[]
) => {
  if (Array.isArray(v)) return
  const key = (v: string) => {
    const acc = [...keyPath, v]
    const str = acc.join('-')
    keyMap[str] = acc
    return str
  }
  if (typeof v === 'string') return <span key={key(v)}>{v}</span>
  return Object.entries(v).map(([k, v]) => (
    <span key={key(k)}>
      {k}
      {build(v, ...keyPath, k)}
    </span>
  ))
}
const list = build(filters)

export default function MapFilter() {
  return (
    <S.Container>
      <S.Title>
        <Icon icon="tune" />
        <h2>Map Style</h2>
      </S.Title>
      <CheckList
        onChange={(key, value) => {
          if (value === 2 || typeof pick(store, ...keyMap[key]) !== 'boolean')
            return
          assign(store, keyMap[key], !!value)
        }}
      >
        {list}
      </CheckList>
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    padding: 1rem;
    width: 100%;
  `,

  Title: styled.div`
    display: flex;
    align-items: center;
    margin-bottom: 1rem;

    h2 {
      font-size: 1.1rem;
      margin: 0;
      margin-left: 0.5rem;
    }

    svg {
      transform: scale(0.9);
    }
  `,
}
