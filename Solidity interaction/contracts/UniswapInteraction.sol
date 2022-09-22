// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IUniswap {
    function swapExactTokensForETH(
        uint256 amountIn,
        uint256 amountOutMin,
        address[] calldata path,
        address to,
        uint256 deadline
    ) external returns (uint256[] memory amounts);

    function WETH() external pure returns (address);
}

interface IERC20 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function balanceOf(address account) external view returns (uint256);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);
}

contract UniswapInteraction {
    IUniswap uniswap;

    event Log(string message, uint256 val);

    constructor(address _uniswap) {
        uniswap = IUniswap(_uniswap);
    }

    function swapTokensForETH(
        address token,
        uint256 amountIn,
        uint256 amountOutMin,
        uint256 deadline
    ) external {
        emit Log("console.log number:", 0);

        IERC20(token).approve(address(this), amountIn);

        emit Log("console.log number:", 1);

        IERC20(token).transferFrom(msg.sender, address(this), amountIn);

        emit Log("console.log number:", 2);

        address[] memory path = new address[](2);
        path[0] = token;
        path[1] = uniswap.WETH();
        IERC20(token).approve(address(uniswap), amountIn);

        emit Log("console.log number:", 3);
        uniswap.swapExactTokensForETH(
            amountIn,
            amountOutMin,
            path,
            msg.sender,
            deadline
        );
        emit Log("console.log number:", 4);
    }
}
