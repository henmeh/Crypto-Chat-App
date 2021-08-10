const moralis = require("moralis");
const tokenAddresses = require("./addresses.js");
const axios = require("axios");
const abi = require("./abi");

moralis.initialize(process.env.REACT_APP_MORALIS_APPLICATION_ID);
moralis.serverURL = process.env.REACT_APP_MORALIS_SERVER_URL;

async function init() {
  window.web3 = await moralis.Web3.enable();
}

init()

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
        if(ethTokenResponse[value.tokenAddress]) imageUrl = ethTokenResponse[value.tokenAddress]["logoURI"];
        else if(polygonTokenResponse[value.tokenAddress]) imageUrl = polygonTokenResponse[value.tokenAddress]["logoURI"];
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
          price: ethTokenPrices[value.tokenAddress] ? ethTokenPrices[value.tokenAddress].usd : polygonTokenPrices[value.tokenAddress].usd,  
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

  swapTokens: async function (_fromTokenAddress, _toTokenAddress, _swapAmount, _fromChain, _toChain, _status) {
    let jobId;
    //if status is "new" Job than we will store the new JobData on Moralis
    if(_status === "new") {
      jobId = await _storeJobData(_fromTokenAddress, _toTokenAddress, _swapAmount, _fromChain, _toChain);
    }

    //Casestudie for different swap scenarios
    //ETH -> ETH or Polygon -> Polygon
    if(_fromChain === _toChain) {
      //Check taht Metamask has the right network
      await _networkCheck(_fromChain);
      //If networkcheck passes the actual swap can follow
      await _doSwap(jobId, 0);
    }

  }

};

async function _storeJobData(_fromTokenAddress, _toTokenAddress, _swapAmount, _fromChain, _toChain) {
  const user = await moralis.User.current();
  const _userAddress = user.attributes.ethAddress;
  const Jobs = moralis.Object.extend("Jobs");
  const job = new Jobs();

  job.set("user", _userAddress);
  job.set("fromTokenAddress", _fromTokenAddress);
  job.set("toTokenAddress", _toTokenAddress);
  job.set("amount", _swapAmount.toString());
  job.set("fromChain", _fromChain);
  job.set("toChain", _toChain);
  job.set("txHash", "");
  job.set("status", "open");

  await job.save();

  return job.id;
}

async function _networkCheck(_networkId) {

  let network = await window.web3.eth.net.getId();
  if (network !== _networkId && network === 1) {
      alert("Please Change Network in Metamask to Polygon and then press OK");
  }
  else if (network !== _networkId && network === 137) {
      alert("Please Change Network in Metamask to Ethereum and then press OK");
  }
}

async function _doSwap(_jobId, _step) {
  const user = await moralis.User.current();
  const _userAddress = user.attributes.ethAddress;

  //find job by id
  const params = { id: _jobId };
  let job = await moralis.Cloud.run("getJobsById", params);

  let _toTokenAddress;
  //decide if there is a swap to eth before bridging
  if (_step === 0) { _toTokenAddress = job.attributes.toTokenAddress; };
  if (_step === 1) { _toTokenAddress = "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"; };
  if (_step === 2) { _toTokenAddress = "0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619".toLowerCase(); };

  //Approve 1inch to spend token
  if (job.attributes.fromTokenAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    window.ERC20TokencontractInstance = new window.web3.eth.Contract(abi.erc20ABI, job.attributes.fromTokenAddress);  
    await window.ERC20TokencontractInstance.methods.approve("0x11111112542d85b3ef69ae05771c2dccff4faa26", job.attributes.amount).send({ from: _userAddress });
  }
  //get TX Data for swap to sign and to do the swap            
  let response;
  if (_step === 0) { 
    await _checkSwapAmount(_jobId, job.attributes.toChain, job.attributes.fromTokenAddress, _toTokenAddress, job.attributes.amount, _userAddress);
    response = await fetch(`https://api.1inch.exchange/v3.0/${job.attributes.toChain}/swap?fromTokenAddress=${job.attributes.fromTokenAddress}&toTokenAddress=${_toTokenAddress}&amount=${job.attributes.amount}&fromAddress=${_userAddress}&slippage=1`); }
  if (_step === 1 || _step === 2) { 
    await _checkSwapAmount(_jobId, job.attributes.fromChain, job.attributes.fromTokenAddress, _toTokenAddress, job.attributes.amount, _userAddress);
    response = await fetch(`https://api.1inch.exchange/v3.0/${job.attributes.fromChain}/swap?fromTokenAddress=${job.attributes.fromTokenAddress}&toTokenAddress=${_toTokenAddress}&amount=${job.attributes.amount}&fromAddress=${_userAddress}&slippage=1`); }

  const swap = await response.json();
  const send = await window.web3.eth.sendTransaction(swap.tx);

  job.set("txHash", send.transactionHash);
  job.set("status", "swapped");
  job.set("amount", swap["toTokenAmount"]);
  await job.save();
  return ["swapped", swap["toTokenAmount"]];
}

async function _checkSwapAmount(_jobId, _chain, _fromTokenAddress, _toTokenAddress, _amount, _userAddress) {
  if(_fromTokenAddress === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
    try {
          //find job by id
          const params = { id: _jobId };
          let job = await moralis.Cloud.run("getJobsById", params);

          //getting the balance of native currency
          let balanceResponse = await _getBalancesByAddress(_fromTokenAddress, _chain);
          let balance = balanceResponse[1];
          //calculation Tx cost => gas * gasprice
          let txResponse = await fetch(`https://api.1inch.exchange/v3.0/${_chain}/swap?fromTokenAddress=${_fromTokenAddress}&toTokenAddress=${_toTokenAddress}&amount=${(parseInt(_amount) * 0.75).toString()}&fromAddress=${_userAddress}&slippage=1`)
          let txData = await txResponse.json();
          let gas = txData.tx.gas;
          let gasPrice = txData.tx.gasPrice;

          if(parseInt(_amount) + (gas * gasPrice * 1.25) > parseInt(balance)) {
              let newAmount = parseInt(_amount) - (gas * gasPrice * 1.25);
              job.set("amount", newAmount);
          }
    } catch (error) { console.log(error); }
  }   
}

async function _getBalancesByAddress(_tokenAddress, _chain) {
  try {
      let amount;
      let balance;
      const user = await moralis.User.current();
      const params = { tokenAddress: _tokenAddress, address: user.attributes.ethAddress };
  
      if(_chain === 1 && _tokenAddress === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
          let token = await moralis.Cloud.run("getEthBalance", params);
          balance = parseInt(token) / Math.pow(10, 18);
          amount = token;
      }
      
      else if(_chain === 1 && _tokenAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
          let token = await moralis.Cloud.run("getEthTokenBalance", params);
          balance = parseInt(token.attributes.balance) / Math.pow(10, parseInt(token.attributes.decimals));
          amount = token.attributes.balance;
      }
  
      else if(_chain === 137 && _tokenAddress === "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
          let token = await moralis.Cloud.run("getPolygonBalance", params);
          balance = parseInt(token) / Math.pow(10, 18);
          amount = token;
      }
      
      else if(_chain === 137 && _tokenAddress !== "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee") {
          let token = await moralis.Cloud.run("getPolygonTokenBalance", params);
          balance = parseInt(token.attributes.balance) / Math.pow(10, parseInt(token.attributes.decimals));
          amount = token.attributes.balance;
      }
      return ([balance.toString(), amount]);

  } catch (error) { console.log(error); }
}