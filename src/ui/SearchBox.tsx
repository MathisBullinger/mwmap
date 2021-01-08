import React from 'react'
import styled from 'styled-components'
import Input from './SearchInput'
import Button from './components/Button'

type Props = {
  onToggleMenu(): void
  value: string
  onChange(v: string): void
}

export default function SearchBox({ onToggleMenu, value, onChange }: Props) {
  return (
    <S.Box>
      <Button icon="menu" onClick={onToggleMenu}>
        Menu
      </Button>
      <Input value={value} onChange={onChange} />
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

    @supports (backdrop-filter: blur(1px)) {
      &,
      * {
        background-color: transparent;
      }

      backdrop-filter: blur(20px) brightness(150%) saturate(80%);

      --text-color: #000;
    }

    button {
      width: var(--box-height);
    }
  `,
}
