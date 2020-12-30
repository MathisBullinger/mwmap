import React from 'react'
import styled from 'styled-components'

type Props = {
  icon: 'menu' | 'arrow_left' | 'arrow_right'
}

export default function Icon({ icon }: Props) {
  return (
    <S.Icon viewBox="0 0 24 24" width={24} height={24}>
      <path d={icons[icon]} />
    </S.Icon>
  )
}

const icons: { [K in Props['icon']]: string } = {
  menu: 'M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z',
  arrow_left: 'M14 7l-5 5 5 5V7z',
  arrow_right: 'M10 17l5-5-5-5v10z',
}

const S = {
  Icon: styled.svg``,
}
