import React from "react";
import PropTypes from "prop-types";
import styled from "styled-components";

const Td = styled.td`
  width: 15vh;
`;

const Img = styled.img`
  width: 35px;
  height: 35px;
`;

const formatBalance = (balance, decimals) => (balance / Math.pow(10, decimals)).toFixed(8);
const valueCalculator = (balance, decimals, price) => ((balance / Math.pow(10, decimals)) * price).toFixed(2)

export default function Balance(props) {
  return (
    <tr>
      <Td><Img src = {props.image} /></Td>
      <Td>{props.name}</Td>
      <Td>{props.ticker}</Td>
      <Td>{formatBalance(props.balance, props.decimals)}</Td>
      <Td><Img src = {props.chain}/></Td>
      <Td>{valueCalculator(props.balance, props.decimals, props.price)}</Td>
    </tr>
  );
}

Balance.propTypes = {
  symbol: PropTypes.string.isRequired,
  name: PropTypes.string.isRequired,
  ticker: PropTypes.string.isRequired,
  balance: PropTypes.number.isRequired,
  decimals: PropTypes.number.isRequired,
};
