import React, { useState } from 'react'
import styled from 'styled-components'
import SearchBox from './SearchBox'
import Button from './components/Button'

export default function SearchPanel() {
  const [expanded, setExpanded] = useState(false)
  const [hidden, setHidden] = useState(false)

  return (
    <S.Container
      data-style={expanded ? 'expanded' : 'collapsed'}
      hidden={hidden}
    >
      <SearchBox onToggleMenu={() => setExpanded(!expanded)} />
      <S.ToggleHide>
        <Button
          icon={hidden ? 'arrow_right' : 'arrow_left'}
          onClick={() => setHidden(!hidden)}
        >
          {hidden ? 'show' : 'hide'}
        </Button>
      </S.ToggleHide>
    </S.Container>
  )
}

const S = {
  Container: styled.div`
    position: fixed;
    left: 0;
    top: 0;
    padding: 1rem;
    width: 18rem;
    height: 100vh;
    transition: transform 0.3s ease;

    --box-radius: 0.3rem;
    --box-height: 2.5rem;

    &::before {
      content: '';
      background-color: #fff;
      display: block;
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      z-index: -1;
      transform: scaleX(0.89) translateY(1rem) scaleY(0);
      transform-origin: center top;
      transition: transform 0.3s ease;
    }

    &[data-style='collapsed'] {
      pointer-events: none;
    }

    &[data-style='expanded']::before {
      transform: none;
      border-radius: 0;
    }

    &[hidden] {
      display: initial;
      transform: translateX(-100%);
    }
  `,

  ToggleHide: styled.div`
    position: absolute;
    width: 1rem;
    height: var(--box-height);
    background: #fff;
    top: 1rem;
    left: 100%;
    transition: opacity 0s 0.3s;

    button {
      width: 100%;
      height: 100%;

      svg {
        transform: translateX(-20%);
      }
    }

    *[data-style='collapsed'] > & {
      opacity: 0;
      transition: none;
    }
  `,
}
