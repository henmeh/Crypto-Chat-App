import React from "react";
import styled from "styled-components";

const Header = styled.header`
  background-color: #282c34;
  min-height: 10vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  color: white;
`;

const H1 = styled.h1`
  font-size: 2.5rem;
  margin: 0px 0px 0px 15px
`;

export default function XChainSwapHeader(props) {
  return (
    <Header>
      <H1>CryptoChat</H1>
     {props.user ? <button onClick={props.onLogout}>LogOut</button> : <button onClick={props.onLogin}>LogIn</button>} 
    </Header>
  );
}
