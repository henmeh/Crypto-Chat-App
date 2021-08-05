import React, { useEffect } from "react";
import XChainSwapHeader from "./components/Header/Header";
import BalanceList from "./components/BalanceList/balanceList";
import SwapJobList from "./components/SwapJobList/swapJobList";
import moralis from "moralis";
import styled from "styled-components";
import {getMyBalances, getMyEthTransactions, getMyPolygonTransactions, Login, Logout} from "./functions/functions";
import axios from "axios";

const Div1 = styled.div`
  text-align: center;
`;

const Div2 = styled.div`
  text-align: center;
  float: left;
`;

const Div3 = styled.div`
  text-align: center;
  float: right;
`;

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

const initialUser = moralis.User.current();

function App() {
  const [balanceData, setBalanceData] = React.useState([]);
  const [ethJobData, setEthJobData] = React.useState([]);
  const [polygonJobData, setPolygonJobData] = React.useState([]);
  const [user, setUser] = React.useState(initialUser);

  const componentDidMount = async () => {
    if (user) {
      //Fetching tokens from 1Inch API
      const ethTokenResponse = await axios.get("https://api.1inch.exchange/v3.0/1/tokens");
      const polygonTokenResponse = await axios.get("https://api.1inch.exchange/v3.0/137/tokens");

      let balances = await getMyBalances(user.attributes.ethAddress, ethTokenResponse, polygonTokenResponse);
      setBalanceData(balances);
   
      let ethTransactions = await getMyEthTransactions(user.attributes.ethAddress);
      let polygonTransactions = await getMyPolygonTransactions(user.attributes.ethAddress);
      setEthJobData(ethTransactions);
      setPolygonJobData(polygonTransactions);
    } //else {
      
    //}
  };

  useEffect(() => {
    if (balanceData.length === 0) {
      //component did mount
      componentDidMount();
    } else {
      //component did update
    }
  });

  const onLogin = async () => {
    let user = await Login();
    setUser(user);
  };
  const onLogout = async () => {
    let user = await Logout();
    setUser(user);
  };

  return (
    <Div1>
      <XChainSwapHeader user={user} onLogin={onLogin} onLogout={onLogout} />
      <BalanceList balanceData={balanceData} />
      <Div2><SwapJobList jobData={ethJobData} /></Div2>
      <Div3><SwapJobList jobData={polygonJobData} /></Div3>    
    </Div1>
  );
}

export default App;