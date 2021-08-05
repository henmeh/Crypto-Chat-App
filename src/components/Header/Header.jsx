import React from "react";
import styled from "styled-components";

const Header = styled.header`
  background-color: #282c34;
  min-height: 20vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  color: white;
`;

const H1 = styled.h1`
  font-size: 4rem;
`;

export default function XChainSwapHeader(props) {
  return (
    <Header>
      <H1>XChainSwap</H1>
     {props.user ? <button onClick={props.onLogout}>LogOut</button> : <button onClick={props.onLogin}>LogIn</button>} 
    </Header>
  );
}
