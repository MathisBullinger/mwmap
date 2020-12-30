import React from 'react'
import styled from 'styled-components'

export default function SearchInput() {
  return <S.Input placeholder="Search location" />
}

const S = {
  Input: styled.input`
    border: none;
    border-radius: 0;
    flex-grow: 1;
    line-height: var(--height);

    &:focus {
      outline: none;
    }
  `,
}
