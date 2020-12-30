import React from 'react'
import styled from 'styled-components'
import Input from './SearchInput'
import Button from './components/Button'

type Props = {
  onToggleMenu(): void
}

export default function SearchBox({ onToggleMenu }: Props) {
  return (
    <S.Box>
      <Button icon="menu" onClick={onToggleMenu}>
        Menu
      </Button>
      <Input />
    </S.Box>
  )
}

const S = {
  Box: styled.div`
    width: 100%;
    display: block;
    background-color: #fff;
    height: var(--box-height);
    display: flex;
    flex-direction: row;
    border-radius: var(--box-radius);
    overflow: hidden;
    pointer-events: initial;

    button {
      width: var(--box-height);
    }
  `,
}