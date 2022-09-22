const UniswapInteraction = artifacts.require("UniswapInteraction");
const ERC20 = artifacts.require("IERC20");

module.exports = async function (deployer, network, accounts) {
  const tokenAddress = "0xad71c4a2dd7cb278e56efa9aa27518a238704380"; //here CMC token on ropsten
  const uniswapRouterAddress = "0x7a250d5630b4cf539739df2c5dacb4c659f2488d"; //same address on multiple network, here we will test on ropsten as token address is on ropsten for this example

  await deployer.deploy(UniswapInteraction, uniswapRouterAddress);
  const UniswapInteractionInstance = await UniswapInteraction.deployed();

  // Get ERC20 Token contract instance
  let token = new web3.eth.Contract(ERC20.abi, tokenAddress);

  // ERC20 token amount value approval
  let amount = web3.utils.toBN(100);
  let decimals = web3.utils.toBN(18);
  let value = amount.mul(web3.utils.toBN(10).pow(decimals));
  console.log("value =>", value.toString());

  // Allow my solidity contract UniInteraction deployed to use owner tokens
  const approve = await token.methods
    .approve(UniswapInteractionInstance.address, value)
    .send({ from: accounts[0] });

  //see Allowance:
  const allowance = await token.methods
    .allowance(accounts[0], UniswapInteractionInstance.address)
    .call();
  console.log("allowance =>", allowance);

  // swap token for eth directly in this script:

  //set amount of tokens to swap for eth:
  let value2 = web3.utils.toBN(1).mul(web3.utils.toBN(10).pow(decimals));
  console.log("value2 =>", value2.toString());

  //user balance before transaction:
  let balanceBefore = await token.methods.balanceOf(accounts[0]).call();
  console.log("balanceBefore =>", balanceBefore);

  // see parameters in UniInteraction.sol contract, 4th parameters is timestamp
  const transac = await UniswapInteractionInstance.swapTokensForETH(
    "0xAD71C4A2dD7CB278E56eFa9aA27518a238704380",
    value2,
    0,
    1663921878
  );

  //user balance after transaction:
  let balanceAfter = await token.methods.balanceOf(accounts[0]).call();
  console.log("balanceAfter =>", balanceAfter);

  console.log(
    "amount of tokens spend in transaction =>",
    (balanceBefore -= balanceAfter) / web3.utils.toBN(10).pow(decimals)
  );
};
