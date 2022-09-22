// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

interface IERC20_2 {
    function transferFrom(
        address sender,
        address recipient,
        uint256 amount
    ) external returns (bool);

    function approve(address spender, uint256 amount) external returns (bool);

    function allowance(address owner, address spender)
        external
        view
        returns (uint256);

    function balanceOf(address account) external view returns (uint256);
}

interface ISwapRouter {
    struct ExactInputSingleParams {
        address tokenIn;
        address tokenOut;
        uint24 fee;
        address recipient;
        uint256 deadline;
        uint256 amountIn;
        uint256 amountOutMinimum;
        uint160 sqrtPriceLimitX96;
    }

    /// @notice Swaps `amountIn` of one token for as much as possible of another token
    /// @param params The parameters necessary for the swap, encoded as `ExactInputSingleParams` in calldata
    /// @return amountOut The amount of the received token
    function exactInputSingle(ExactInputSingleParams calldata params)
        external
        payable
        returns (uint256 amountOut);
}

contract UniswapInteraction2 {
    ISwapRouter public immutable swapRouter;

    address public constant WETH9 = 0xd0A1E359811322d97991E03f863a0C30C2cF029C;

    // Phere pool fees at 0.3%
    uint24 public constant poolFee = 3000;

    constructor(ISwapRouter _swapRouter) {
        swapRouter = _swapRouter;
    }

    function swapExactInputSingle(uint256 amountIn, address _token) external {
        // Transfert dtokens to smart contract ! need to approve this transfer first
        IERC20_2(_token).transferFrom(msg.sender, address(this), amountIn);

        // allow uniswap to use our tokens
        IERC20_2(_token).approve(address(swapRouter), amountIn);

        //Create parameters to call the swap function
        ISwapRouter.ExactInputSingleParams memory params = ISwapRouter
            .ExactInputSingleParams({
                tokenIn: _token,
                tokenOut: WETH9,
                fee: poolFee,
                recipient: msg.sender,
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0,
                sqrtPriceLimitX96: 0
            });

        // swap then ETH will be transfer to msg.sender
        swapRouter.exactInputSingle(params);
    }
}
