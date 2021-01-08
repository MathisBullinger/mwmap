import React, { useState } from 'react'
import styled from 'styled-components'
import { useComputed } from 'ui/utils/hooks'
import { locations as locs } from 'data/locations/locations.json'

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
        <S.Result key={id}>{name}</S.Result>
      ))}
    </S.Box>
  )
}

const S = {
  Box: styled.ol`
    border: 1px dotted red;
    height: 50%;
  `,

  Result: styled.li``,
}
