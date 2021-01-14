import React, { useState } from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'
import { useSearch } from 'src/ui/search'
import styled from 'styled-components'
import SearchBox from './SearchBox'
import Button from './components/Button'
import Edit from './Edit'
import Filter from './MapFilter'
import ResultBox from './ResultBox'
import Place from './Place'
import { goto } from 'src/map/interaction'

export default function SearchPanel() {
  const [expanded, setExpanded] = useState(false)
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
      {!expanded && searchResults.length > 0 && (
        <ResultBox
          results={searchResults}
          preview={true}
          onSelect={id => {
            setExpanded(true)
            goto(id)
          }}
        />
      )}
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
            {expanded && <MainBody results={searchResults} goto={goto} />}
          </Route>
          <Route path="/edit" exact>
            <Edit />
          </Route>
          <Route path="/place/:name" exact component={Place} />
          <Redirect to="/" />
        </Switch>
      </S.Body>
    </S.Container>
  )
}

function MainBody({
  results,
  goto,
}: {
  results: string[]
  goto(id: string): void
}) {
  return (
    <>
      <ResultBox results={results} onSelect={goto} />
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

      & > *:not(:first-child):not([data-style='preview']) {
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
  `,
}
