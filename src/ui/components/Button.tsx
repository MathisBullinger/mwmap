import React from 'react'
import styled from 'styled-components'
import Icon from './Icon'

type Props = {
  icon?: ReactProps<typeof Icon>['icon']
  children: string
  onClick?(): void
}

export default function Button({ icon, children: label, onClick }: Props) {
  if (!icon) return <button onClick={() => onClick?.()}>{label}</button>
  return (
    <S.IcoBt aria-label={label} onClick={() => onClick?.()}>
      <Icon icon={icon} />
    </S.IcoBt>
  )
}

const S = {
  IcoBt: styled.button`
    appearance: none;
    display: block;
    border: none;
    background-color: transparent;
    padding: 0;
    cursor: pointer;

    &:focus {
      outline: none;
    }

    &:active {
      background-color: #ddd;
    }
  `,
}
