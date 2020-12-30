import React from 'react'
import styled from 'styled-components'
import SearchBox from './SearchBox'

export default function SearchPanel() {
  return (
    <S.Container>
      <SearchBox />
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    position: fixed;
    left: 1rem;
    top: 1rem;
    width: 18rem;
  `,
}
