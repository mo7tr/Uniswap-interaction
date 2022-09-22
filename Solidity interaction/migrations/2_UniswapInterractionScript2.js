const UniswapInteraction2 = artifacts.require("UniswapInteraction2");
const ERC20 = artifacts.require("IERC20_2");

module.exports = async function (deployer, network, accounts) {
  const tokenAddress = "0x4F96Fe3b7A6Cf9725f59d353F723c1bDb64CA6Aa"; // here Dai on kovan
  const uniswapRouterV3KovanAddress =
    "0xE592427A0AEce92De3Edee1F18E0157C05861564";

  await deployer.deploy(UniswapInteraction2, uniswapRouterV3KovanAddress);
  const UniswapInteraction2Instance = await UniswapInteraction2.deployed();

  //Use BigNumber
  let decimals = web3.utils.toBN(18);
  let amount = web3.utils.toBN(10);

  // calculate ERC20 token amount
  let value = amount.mul(web3.utils.toBN(10).pow(decimals));

  // Get ERC20 Token contract instance
  let token = new web3.eth.Contract(ERC20.abi, tokenAddress);

  // Allow UniswapInteraction2 smart contrat to transfer owner tokens
  await token.methods
    .approve(UniswapInteraction2Instance.address, value)
    .send({ from: accounts[0] });

  // see Allowance:
  const allowance = await token.methods
    .allowance(accounts[0], UniswapInteraction2Instance.address)
    .call();
  console.log("allowance =>", allowance);

  // swap:

  // user balance before transaction:
  let balanceBefore = await token.methods.balanceOf(accounts[0]).call();
  console.log("balanceBefore =>", balanceBefore);

  const transac = await UniswapInteraction2Instance.swapExactInputSingle(
    value,
    tokenAddress
  );
  //   console.log(transac);

  // user balance after transaction:
  let balanceAfter = await token.methods.balanceOf(accounts[0]).call();
  console.log("balanceAfter =>", balanceAfter);

  console.log(
    "amount of tokens spend in transaction =>",
    (balanceBefore -= balanceAfter) / web3.utils.toBN(10).pow(decimals)
  );
};
