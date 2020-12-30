import React from 'react'
import styled from 'styled-components'
import Input from './SearchInput'
import Button from './components/Button'

export default function SearchBox() {
  return (
    <S.Box>
      <Button icon="menu">Menu</Button>
      <Input />
    </S.Box>
  )
}

const S = {
  Box: styled.div`
    width: 100%;
    display: block;
    background-color: #fff;
    --height: 2.5rem;
    height: var(--height);
    display: flex;
    flex-direction: row;

    button {
      width: var(--height);
    }
  `,
}
