import React from 'react'
import styled from 'styled-components'

type Props = {
  icon: 'menu' | 'arrow_left' | 'arrow_right' | 'tune'
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
  tune:
    'M3 18c0 .55.45 1 1 1h5v-2H4c-.55 0-1 .45-1 1zM3 6c0 .55.45 1 1 1h9V5H4c-.55 0-1 .45-1 1zm10 14v-1h7c.55 0 1-.45 1-1s-.45-1-1-1h-7v-1c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1s1-.45 1-1zM7 10v1H4c-.55 0-1 .45-1 1s.45 1 1 1h3v1c0 .55.45 1 1 1s1-.45 1-1v-4c0-.55-.45-1-1-1s-1 .45-1 1zm14 2c0-.55-.45-1-1-1h-9v2h9c.55 0 1-.45 1-1zm-5-3c.55 0 1-.45 1-1V7h3c.55 0 1-.45 1-1s-.45-1-1-1h-3V4c0-.55-.45-1-1-1s-1 .45-1 1v4c0 .55.45 1 1 1z',
}

const S = {
  Icon: styled.svg`
    fill: var(--text-color);
  `,
}
