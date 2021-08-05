import React from "react";
import Balance from "../Balance/balance";
import styled from "styled-components";

const Table = styled.table`
  font-size: 1.4rem;
  margin: 0px 0px 0px 0px
`;

const Tr = styled.tr`
border: 1px solid #cccccc;
`

export default function BalanceList(props) {
    return (
      <Table className="table table-primary table-bordered">
        <thead>
          <Tr>
          <th>Symbol</th>
            <th>Name</th>
            <th>Ticker</th>
            <th>Balance</th>
            <th>Chain</th>
            <th>Value USD</th>
          </Tr>
        </thead>
        <tbody>
          {props.balanceData.map(({ symbol, name, balance, price, decimals, tokenAddress, image, chain }) => (
            <Balance
              key={tokenAddress}
              symbol={symbol}
              name={name}
              ticker={symbol}
              balance={parseInt(balance)}
              decimals={parseInt(decimals)}
              image={image}
              price={price}
              chain={chain}
            />
          ))}
        </tbody>
      </Table>
    );
  
}