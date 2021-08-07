import React, { useEffect } from "react";
import XChainSwapHeader from "./components/Header/Header";
import BalanceList from "./components/BalanceList/balanceList";
import SwapJobList from "./components/SwapJobList/swapJobList";
import Swap from "./components/Swap/swap";
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
      let loadingData = await Promise.all([
        axios.get("https://api.1inch.exchange/v3.0/1/tokens"),
        axios.get("https://api.1inch.exchange/v3.0/137/tokens"),])
      
      let ethTokenResponse = loadingData[0].data.tokens;
      let polygonTokenResponse = loadingData[1].data.tokens;

      console.log(Object.values(ethTokenResponse));

      loadingData = await Promise.all([
        getMyBalances(user.attributes.ethAddress, ethTokenResponse, polygonTokenResponse),
        getMyEthTransactions(user.attributes.ethAddress),
        getMyPolygonTransactions(user.attributes.ethAddress),
      ]);

      let balances = loadingData[0];
      setBalanceData(balances);
   
      let ethTransactions = loadingData[1];
      let polygonTransactions = loadingData[2];
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
      <Div2><BalanceList balanceData={balanceData} /></Div2>
      <Div3><Swap user={user}/></Div3>
      <Div2><SwapJobList jobData={ethJobData} /></Div2>
      <Div3><SwapJobList jobData={polygonJobData} /></Div3>    
    </Div1>
  );
}

export default App;