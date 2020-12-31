import React from 'react'
import styled from 'styled-components'
import Icon from './components/Icon'
import CheckList from './components/CheckList'

export default function MapFilter() {
  return (
    <S.Container>
      <S.Title>
        <Icon icon="tune" />
        <h2>Map Style</h2>
      </S.Title>
      <CheckList onChange={console.log}>
        <span>
          Places
          <span>Cities</span>
        </span>
        <span>
          Overlays
          <span>Regions</span>
          <span>Almsivi Intervention</span>
          <span>Divine Intervention</span>
        </span>
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
