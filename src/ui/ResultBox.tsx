import React from 'react'
import styled from 'styled-components'
import { useComputed } from 'ui/utils/hooks'
import { locations as locs } from 'data/locations/locations.json'
import { Link } from 'react-router-dom'

type Props = {
  results: string[]
}

export default function ResultBox({ results }: Props) {
  const locations = useComputed(
    ids => ids.map(id => locs.find(v => v.id === id)!),
    results
  )

  return (
    <S.Box>
      {locations.map(({ id, name }) => (
        <S.Result key={id}>
          <Link to={`/place/${name.replace(/\s/g, '')}`}>{name}</Link>
        </S.Result>
      ))}
    </S.Box>
  )
}

const S = {
  Box: styled.ol`
    height: 50%;
    overflow-y: auto;
    padding: 0 1rem;
    padding-top: 0.5rem;
  `,

  Result: styled.li`
    width: 100%;
    height: 2rem;

    a {
      text-decoration: none;
      color: inherit;
      display: block;
      width: 100%;
      height: 100%;
    }
  `,
}
