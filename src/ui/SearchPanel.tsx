import React, { useState } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import styled from 'styled-components'
import SearchBox from './SearchBox'
import Button from './components/Button'
import Edit from './Edit'
import Filter from './MapFilter'
import ResultBox from './ResultBox'
import { useSearch } from 'src/ui/search'

export default function SearchPanel() {
  const [expanded, setExpanded] = useState(true)
  const [hidden, setHidden] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const searchResults = useSearch(searchQuery)

  return (
    <S.Container
      data-style={expanded ? 'expanded' : 'collapsed'}
      hidden={hidden}
    >
      <SearchBox
        onToggleMenu={() => setExpanded(!expanded)}
        value={searchQuery}
        onChange={setSearchQuery}
      />
      <S.ToggleHide>
        <Button
          icon={hidden ? 'arrow_right' : 'arrow_left'}
          onClick={() => setHidden(!hidden)}
        >
          {hidden ? 'show' : 'hide'}
        </Button>
      </S.ToggleHide>
      <S.Body>
        <Switch>
          <Route path="/" exact>
            <MainBody results={searchResults} />
          </Route>
          <Route path="/edit" exact>
            <Edit />
          </Route>
          <Redirect to="/" />
        </Switch>
      </S.Body>
    </S.Container>
  )
}

function MainBody({ results }: { results: string[] }) {
  return (
    <>
      <ResultBox results={results} />
      <Filter />
      {/* <Menu /> */}
    </>
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

    & > *:not(:first-child) {
      transition: opacity 0s 0.3s;
    }

    &[data-style='collapsed'] {
      pointer-events: none;

      & > *:not(:first-child) {
        opacity: 0;
        transition: none;
      }
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

    button {
      width: 100%;
      height: 100%;

      svg {
        transform: translateX(-20%);
      }
    }

    [hidden] > & {
      border-top-right-radius: 0.5rem;
      border-bottom-right-radius: 0.5rem;

      @supports (backdrop-filter: blur(1px)) {
        background-color: transparent;
        backdrop-filter: brightness(110%) blur(5px);
        fill: #000b;
      }
    }
  `,

  Body: styled.div`
    height: calc(100vh - 1rem - var(--box-height));
    position: absolute;
    left: 0;
    width: 100%;
    overflow-y: auto;
    display: flex;
    flex-direction: column;
    padding-top: 2rem;
  `,
}
