import React from 'react'
import styled from 'styled-components'

type Props = {
  value: string
  onChange(v: string): void
}

export default function SearchInput({ value, onChange }: Props) {
  return (
    <S.Input
      placeholder="Search location"
      type="search"
      value={value}
      onChange={({ target }) => onChange(target.value)}
    />
  )
}

const S = {
  Input: styled.input`
    border: none;
    border-radius: 0;
    flex-grow: 1;
    line-height: var(--height);
    color: var(--text-color);

    &::placeholder {
      color: #000a;
    }

    &:focus {
      outline: none;
    }
  `,
}
