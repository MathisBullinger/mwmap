import React from 'react'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

export default function Menu() {
  return (
    <S.Menu>
      <S.List>
        <li>
          <Link to="/edit">Edit Map</Link>
        </li>
      </S.List>
    </S.Menu>
  )
}

const S = {
  Menu: styled.nav`
    margin-top: auto;
  `,

  List: styled.ol`
    padding: 1rem;
    list-style: none;

    a {
      color: inherit;
      text-decoration: none;
    }
  `,
}
