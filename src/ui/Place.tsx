import React from 'react'
import styled from 'styled-components'
import { useComputed } from 'ui/utils/hooks'
import { useHistory } from 'react-router-dom'
import { locations } from 'data/locations/locations.json'

export default function Place({ match }) {
  const history = useHistory()
  const { name, description, wiki } = useComputed(
    v =>
      locations.find(
        ({ name }) => name.replace(/\s/g, '').toLowerCase() === v
      )! ?? {},
    match.params.name.toLowerCase() as string
  )

  if (!name) history.replace('/')
  return (
    <S.Place>
      <S.Title>{name}</S.Title>
      <S.Description>{description}</S.Description>
      <S.Wiki
        href={`https://en.uesp.net/wiki/${wiki}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        wiki
      </S.Wiki>
    </S.Place>
  )
}

const S = {
  Place: styled.div`
    padding: 1rem;
  `,

  Title: styled.h1`
    font-size: 1.5rem;
    font-weight: bold;
  `,

  Description: styled.p`
    margin-top: 1rem;
  `,

  Wiki: styled.a``,
}
