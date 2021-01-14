import React from 'react'
import styled from 'styled-components'
import { useComputed } from 'ui/utils/hooks'
import { locations as locs } from 'data/locations/locations.json'
import { Link } from 'react-router-dom'

type Props = {
  results: string[]
  preview?: boolean
  onSelect?(): void
}

export default function ResultBox({
  results,
  preview = false,
  onSelect,
}: Props) {
  const locations = useComputed(
    ids => ids.map(id => locs.find(v => v.id === id)!),
    results
  )

  return (
    <S.Box data-style={preview ? 'preview' : 'embed'}>
      {locations.map(({ id, name }) => (
        <S.Result key={id}>
          <Link
            to={`/place/${name.replace(/\s/g, '')}`}
            onClick={() => onSelect?.()}
          >
            {name}
          </Link>
        </S.Result>
      ))}
    </S.Box>
  )
}

const S = {
  Box: styled.ol`
    height: 50%;
    overflow-y: auto;
    padding: 0.5rem 1rem;

    &[data-style='preview'] {
      pointer-events: all;
      background-color: #fff;
      margin-left: -0.4rem;
      width: 100%;
      height: unset;
      max-height: 25%;
      border-bottom-left-radius: var(--box-radius);
      border-bottom-right-radius: var(--box-radius);
    }
  `,

  Result: styled.li`
    width: 100%;
    height: 2rem;
    line-height: 2rem;
    margin: 0;

    a {
      text-decoration: none;
      color: inherit;
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
}
