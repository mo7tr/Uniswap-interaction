require("dotenv").config();
const { ethers } = require("ethers");

const {
  ChainId,
  Fetcher,
  WETH,
  Route,
  Trade,
  TokenAmount,
  TradeType,
  Percent,
} = require("@uniswap/sdk");

function toHex(Amount) {
  return `0x${Amount.raw.toString(16)}`;
}

// const chainId = ChainId.MAINNET; //ChainId : pour identifier sur quel réseau nous allons nous connecter ici mainnet
const chainId = ChainId.ROPSTEN; //ici Ropsten
// console.log(1, `The chainId of ropsten is ${ChainId.ROPSTEN}.`);

const tokenAddress = "0xaD6D458402F60fD3Bd25163575031ACDce07538D"; // DAI address Ropsten, feel free to substitute

const init = async () => {
  const token = await Fetcher.fetchTokenData(chainId, tokenAddress);
  //   console.log(2, "token =>", token);

  const weth = WETH[chainId];
  //   console.log(3, "weth =>", weth);

  const pair = await Fetcher.fetchPairData(token, weth);
  //   console.log(4, "pair =>", pair);

  const route = new Route([pair], weth);
  //   console.log(5, "route =>", route);
  console.log(6, "midPrice =>", route.midPrice.toSignificant(6)); //give the amount of tokens for 1 weth as a string cause it's a BN with 6 numbers
  console.log(
    7,
    "inverse midPrice =>",
    route.midPrice.invert().toSignificant(6)
  ); // the invert price

  // as my ROPSTEN eth balance is low, i'm gonna use 0,1eth (1eth with 17 "0" as decimals)
  const trade = new Trade(
    route,
    new TokenAmount(weth, "100000000000000000"),
    TradeType.EXACT_INPUT
  );
  //   console.log(8, "trade =>", trade);

  console.log(9, "executionPrice =>", trade.executionPrice.toSignificant(6));
  console.log(10, "nextMidPrice =>", trade.nextMidPrice.toSignificant(6));

  const slippageTolerance = new Percent("50", "10000"); //50 bips = 0.5 %
  //   console.log(11, "slippageTolerance =>", slippageTolerance);

  const amountOutMin = toHex(trade.minimumAmountOut(slippageTolerance)); //needs to be converted to e.g. hex
  //   console.log(12, "amountOutMin =>", amountOutMin);

  const path = [weth.address, token.address];
  let to = ""; //address
  const deadline = Math.floor(Date.now() / 1000) + 60 * 20; //need to /1000 cause deadline is in second and Date.now is in ms
  const value = toHex(trade.inputAmount);

  //use of ethers.js library, different ways to get the provider

  //   const provider = ethers.getDefaultProvider("ropsten", {
  //     infura: `https://ropsten.infura.io/v3/${process.env.INFURA_ID}`,
  //   });

  const provider = new ethers.providers.InfuraProvider(
    "ropsten",
    `${process.env.INFURA_ID}`
  );
  //   console.log(13, "provider =>", provider);

  const signer = new ethers.Wallet(`${process.env.PRIVATE_KEY}`);
  //   console.log(14, "signer =>", signer);

  const account = signer.connect(provider);
  //   console.log(15, "account =>", account);

  //with Ethers library you can init a contract without the abi, just by creating yourself the abi with an array of function signatures that you want to use
  const uniswap = new ethers.Contract(
    "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D",
    [
      "function swapExactETHForTokens(uint amountOutMin, address[] calldata path, address to, uint deadline) external payable returns (uint[] memory amounts)",
    ],
    account
  );
  //   console.log(16, "uniswap =>", uniswap);

  //instantiate Dai contract balanceOf function on Ropsten:
  const tokenBalance = new ethers.Contract(
    tokenAddress,
    ["function balanceOf(address _owner) public view returns (uint balance)"],
    account
  );
  //   console.log("tokenBalance =>", tokenBalance);

  //define "to" with account address
  to = account.address;

  provider.getBalance(to).then((balance) => {
    // convert a currency unit from wei to ether
    const balanceInEth = ethers.utils.formatEther(balance);
    console.log(`--- ETH Balance Before: ${balanceInEth} ETH ---`);
  });

  const getERC20TokenBalanceBefore = await tokenBalance.balanceOf(
    account.address
  );
  console.log(
    `--- ERC20 Balance Before: ${ethers.utils.formatEther(
      getERC20TokenBalanceBefore
    )} ---`
  );

  const tx = await uniswap.swapExactETHForTokens(
    amountOutMin,
    path,
    to,
    deadline,
    { value }
  );
  //   console.log(17, `tx hash => ${tx.hash}`);

  //   const receipt = await tx.wait();
  //   console.log(18, `tx was mined in block ${receipt.blockNumber}`);

  const getERC20TokenBalanceAfter = await tokenBalance.balanceOf(
    account.address
  );
  console.log(
    `--- ERC20 Balance After: ${ethers.utils.formatEther(
      getERC20TokenBalanceAfter
    )} ---`
  );

  provider.getBalance(to).then((balance) => {
    // convert a currency unit from wei to ether
    const balanceInEth = ethers.utils.formatEther(balance);
    console.log(`--- ETH Balance After: ${balanceInEth} ETH ---`);
  });
};

init();
