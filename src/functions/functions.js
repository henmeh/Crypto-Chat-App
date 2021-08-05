const moralis = require("moralis");
const tokenAddresses = require("./addresses.js");
const axios = require("axios");

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

module.exports = {
  Login: async function () {
    try {
      const user = await moralis.authenticate();
      return user;
    } catch (error) {
      console.log(error);
    }
  },

  Logout: async function () {
    try {
      await moralis.User.logOut();
      return false;
    } catch (error) {
      console.log(error);
    }
  },

  getMyBalances: async function (userAddress, ethTokenResponse, polygonTokenResponse) {
    try {
      
      const params = { address: userAddress };
      const response = await moralis.Cloud.run("getMyBalances", params);

      //Variante Preise gebundelt mit einer Anfrage bei Coingecko anfragen, ist etwas schneller, ABER Coingecko verlangt irgendwann geld
      //Fetching token prices
      let priceResponse = await Promise.all([
        axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=ethereum&order=market_cap_desc&per_page=100&page=1&sparkline=false`),
        axios.get(`https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&ids=matic-network&order=market_cap_desc&per_page=100&page=1&sparkline=false`),
        axios.get(`https://api.coingecko.com/api/v3/simple/token_price/ethereum?contract_addresses=${response[2]}&vs_currencies=usd`),
        axios.get(`https://api.coingecko.com/api/v3/simple/token_price/polygon-pos?contract_addresses=${response[3]}&vs_currencies=usd`),
      ]);

      //Setting Ether Price
      response[0][0]["price"] = priceResponse[0].data[0].current_price

      //Setting Matic price
      response[0][1]["price"] = priceResponse[1].data[0].current_price

      const ethTokenPrices = priceResponse[2].data;
      const polygonTokenPrices = priceResponse[3].data;      
      const tokenBalances = response[1].map(function (value) {
        let imageUrl;
        if(ethTokenResponse.data.tokens[value.tokenAddress]) imageUrl = ethTokenResponse.data.tokens[value.tokenAddress]["logoURI"];
        else if(polygonTokenResponse.data.tokens[value.tokenAddress]) imageUrl = polygonTokenResponse.data.tokens[value.tokenAddress]["logoURI"];
        else imageUrl = "No Image";       
        //Variante Preise für jeden Token einzeln bei Moralis anfragen, dauert etwas länger
        //const apiKey = {
        //  "X-API-Key": "ldVQIU0NlXxbxYlA0vedMT2rroif0TjuoCr149Hv4PkWo5KYeFTCmcnEr4xLsaXy"
        //}; 
        //let price = await axios.get(`https://deep-index.moralis.io/api/token/ERC20/${value.tokenAddress}/price?chain=${value.chain}&chain_name=mainnet`, { headers: apiKey });
        //price.data.usdPrice
        return {
          name: value.name,
          symbol: value.symbol,
          balance: value.balance,
          decimals: value.decimals,
          tokenAddress: value.tokenAddress,
          image: imageUrl,
          chain: value.chain,
          price: ethTokenPrices[value.tokenAddress] ? ethTokenPrices[value.tokenAddress].usd : polygonTokenPrices[value.tokenAddress].usd  
        };
      });

      const balances = [response[0][0], response[0][1], ...tokenBalances];
      return balances;
    } catch (error) {
      console.log(error);
    }
  },

  getMyEthTransactions: async function (userAddress) {
    try {
      window.web3 = await moralis.Web3.enable();
      tokenAddresses.mappedPoSTokensEth.push(
        "0xA0c68C638235ee32657e8f720a23ceC1bFc77C77".toLowerCase(),
        "0x401F6c983eA34274ec46f84D70b31C151321188b".toLowerCase(),
        "0x11111112542d85b3ef69ae05771c2dccff4faa26".toLowerCase()
      );
      const paramsTx = {
        address: userAddress,
        tokens: tokenAddresses.mappedPoSTokensEth,
      };
      const responseTransactions = await moralis.Cloud.run(
        "getEthTransactions2",
        paramsTx
      );
      let methode;
      for (var i = 0; i < responseTransactions.length; i++) {
        if (
          responseTransactions[i]["method"].substring(0, 10) ===
          window.web3.eth.abi.encodeFunctionSignature(
            "depositEtherFor(address)"
          )
        ) {
          methode = "Deposit Ether For";
        } else if (
          responseTransactions[i]["method"].substring(0, 10) ===
          window.web3.eth.abi.encodeFunctionSignature("exit(bytes)")
        ) {
          methode = "Exit";
        } else if (
          responseTransactions[i]["method"].substring(0, 10) === "0x8b9e4f93"
        ) {
          methode = "Deposit ERC20 For User";
        } else if (
          responseTransactions[i]["method"].substring(0, 10) === "0x2e95b6c8"
        ) {
          methode = "Swap";
        } else {
          methode = responseTransactions[i]["method"].substring(0, 10);
        }
        responseTransactions[i]["method"] = methode;
      }
      return responseTransactions;
    } catch (error) {
      console.log(error);
    }
  },

  getMyPolygonTransactions: async function (userAddress) {
    try {
      window.web3 = await moralis.Web3.enable();
      tokenAddresses.mappedPoSTokensPolygon.push(
        "0x11111112542d85b3ef69ae05771c2dccff4faa26"
      );
      const paramsTx = {
        address: userAddress,
        tokens: tokenAddresses.mappedPoSTokensPolygon,
      };
      const responseTransactions = await moralis.Cloud.run(
        "getPolygonTransactions2",
        paramsTx
      );
      let methode;
      for (var i = 0; i < responseTransactions.length; i++) {
        if (
          responseTransactions[i]["method"].substring(0, 10) ===
          window.web3.eth.abi.encodeFunctionSignature("withdraw(uint256)")
        ) {
          methode = "Withdraw";
        } else if (
          responseTransactions[i]["method"].substring(0, 10) === "0x7c025200"
        ) {
          methode = "Swap";
        }
        responseTransactions[i]["method"] = methode;
      }
      return responseTransactions;
    } catch (error) {
      console.log(error);
    }
  },
};
