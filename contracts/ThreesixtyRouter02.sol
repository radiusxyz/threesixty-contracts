pragma experimental ABIEncoderV2;
pragma solidity =0.6.12;

import '@uniswap/v2-core/contracts/interfaces/IUniswapV2Factory.sol';
import '@uniswap/lib/contracts/libraries/TransferHelper.sol';

import "./interfaces/IThreesixtyRouter02.sol";
import "./libraries/UniswapV2Library.sol";
import "./libraries/SafeMath.sol";
import "./libraries/Mimc.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IWETH.sol";
import "./interfaces/IBacker.sol";

import "./Recorder.sol";
import "./Vault.sol";

contract ThreesixtyRouter02 is IThreesixtyRouter02 {
  using SafeMath for uint256;

  address public immutable override factory;
  address public immutable override WETH;

  address public immutable vault;

  address public owner;

  address public feeTo;
  address public feeToSetter;

  address public operator;
  address public operatorSetter;

  address public immutable backer;
  address public middleAddress;

  mapping(address => uint256) public nonces;

  uint256 public reimbursementAmount;

  Recorder public recorder;

  struct EIP712Domain {
    string  name;
    string  version;
    uint256 chainId;
    address verifyingContract;
  }

  struct Swap {
    address txOwner;
    bytes4 functionSelector;
    uint256 amountIn;
    uint256 amountOut;
    address[] path;
    address to;
    uint256 nonce;
    uint256 availableFrom;
    uint256 deadline;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant SWAPDOMAIN_TYPEHASH = keccak256("Swap(address txOwner,bytes4 functionSelector,uint256 amountIn,uint256 amountOut,address[] path,address to,uint256 nonce,uint256 availableFrom,uint256 deadline)");
  bytes32 constant CLAIMDOMAIN_TYPEHASH = keccak256("Claim(uint256 round,uint256 order,bytes32 mimcHash,bytes32 txHash,bytes32 proofHash)");
  bytes32 public DOMAIN_SEPARATOR;

  modifier ensure(uint256 deadline) {
    require(deadline >= block.timestamp, "360Router: EXPIRED");
    _;
  }

  event SwapEvent(uint256 round, uint256 index, address userAddress, uint256 nonce, bool success);

  constructor(
    uint256 _chainId,
    address _vault,
    address _factory,
    address _WETH,
    address _feeToSetter,
    address _operatorSetter,
    address _backer,
    uint256 _reimbursementAmount
  ) public {
    vault = _vault;
    factory = _factory;
    WETH = _WETH;
    feeToSetter = _feeToSetter;
    operatorSetter = _operatorSetter;
    owner = msg.sender;
    backer = _backer;
    reimbursementAmount = _reimbursementAmount;

    recorder = new Recorder(msg.sender);

    DOMAIN_SEPARATOR = _generateHashedMessage(EIP712Domain({
      name: "Threesixty swap",
      version: "1",
      chainId: _chainId,
      verifyingContract: address(this)
    }));
  }

  receive() external payable {
    assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
  }

  function setFeeTo(address _feeTo) external {
    require(msg.sender == feeToSetter, "360: FORBIDDEN");
    feeTo = _feeTo;
  }

  function setFeeToSetter(address _feeToSetter) external {
    require(msg.sender == feeToSetter || msg.sender == owner, "360: FORBIDDEN");
    feeToSetter = _feeToSetter;
  }

  function setOperator(address _operator) external {
    require(msg.sender == operatorSetter, "360: FORBIDDEN");
    operator = _operator;
    recorder.setOperator(operator);
  }

  function setOperatorSetter(address _operatorSetter) external {
    require(msg.sender == operatorSetter || msg.sender == owner, "360: FORBIDDEN");
    operatorSetter = _operatorSetter;
  }

  function setMiddleAddress(address _middleAddress) external {
    require(msg.sender == operator, "360: FORBIDDEN");
    middleAddress = _middleAddress;
  }  

  function _generateHashedMessage(EIP712Domain memory eip712Domain) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      EIP712DOMAIN_TYPEHASH,
      keccak256(bytes(eip712Domain.name)),
      keccak256(bytes(eip712Domain.version)),
      eip712Domain.chainId,
      eip712Domain.verifyingContract
    ));
  }

  function _generateHashedMessage(Swap memory swap) internal pure returns (bytes32) {
    return keccak256(abi.encode(
      SWAPDOMAIN_TYPEHASH,
      swap.txOwner,
      swap.functionSelector,
      swap.amountIn,
      swap.amountOut,
      keccak256(abi.encodePacked(swap.path)),
      swap.to,
      swap.nonce,
      swap.availableFrom,
      swap.deadline
    ));
  }

  // **** ADD LIQUIDITY ****
  function _addLiquidity(
      address tokenA,
      address tokenB,
      uint amountADesired,
      uint amountBDesired,
      uint amountAMin,
      uint amountBMin
  ) internal virtual returns (uint amountA, uint amountB) {
      // create the pair if it doesn't exist yet
      if (IUniswapV2Factory(factory).getPair(tokenA, tokenB) == address(0)) {
          IUniswapV2Factory(factory).createPair(tokenA, tokenB);
      }
      (uint reserveA, uint reserveB) = UniswapV2Library.getReserves(factory, tokenA, tokenB);
      if (reserveA == 0 && reserveB == 0) {
          (amountA, amountB) = (amountADesired, amountBDesired);
      } else {
          uint amountBOptimal = UniswapV2Library.quote(amountADesired, reserveA, reserveB);
          if (amountBOptimal <= amountBDesired) {
              require(amountBOptimal >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
              (amountA, amountB) = (amountADesired, amountBOptimal);
          } else {
              uint amountAOptimal = UniswapV2Library.quote(amountBDesired, reserveB, reserveA);
              assert(amountAOptimal <= amountADesired);
              require(amountAOptimal >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
              (amountA, amountB) = (amountAOptimal, amountBDesired);
          }
      }
  }
  function addLiquidity(
      address tokenA,
      address tokenB,
      uint amountADesired,
      uint amountBDesired,
      uint amountAMin,
      uint amountBMin,
      address to,
      uint deadline
  ) external virtual override ensure(deadline) returns (uint amountA, uint amountB, uint liquidity) {
      (amountA, amountB) = _addLiquidity(tokenA, tokenB, amountADesired, amountBDesired, amountAMin, amountBMin);
      address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
      TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
      TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
      liquidity = IUniswapV2Pair(pair).mint(to);
  }
  function addLiquidityETH(
      address token,
      uint amountTokenDesired,
      uint amountTokenMin,
      uint amountETHMin,
      address to,
      uint deadline
  ) external virtual override payable ensure(deadline) returns (uint amountToken, uint amountETH, uint liquidity) {
      (amountToken, amountETH) = _addLiquidity(
          token,
          WETH,
          amountTokenDesired,
          msg.value,
          amountTokenMin,
          amountETHMin
      );
      address pair = UniswapV2Library.pairFor(factory, token, WETH);
      TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
      IWETH(WETH).deposit{value: amountETH}();
      assert(IWETH(WETH).transfer(pair, amountETH));
      liquidity = IUniswapV2Pair(pair).mint(to);
      // refund dust eth, if any
      if (msg.value > amountETH) TransferHelper.safeTransferETH(msg.sender, msg.value - amountETH);
  }

  // **** REMOVE LIQUIDITY ****
  function removeLiquidity(
      address tokenA,
      address tokenB,
      uint liquidity,
      uint amountAMin,
      uint amountBMin,
      address to,
      uint deadline
  ) public virtual override ensure(deadline) returns (uint amountA, uint amountB) {
      address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
      IUniswapV2Pair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
      (uint amount0, uint amount1) = IUniswapV2Pair(pair).burn(to);
      (address token0,) = UniswapV2Library.sortTokens(tokenA, tokenB);
      (amountA, amountB) = tokenA == token0 ? (amount0, amount1) : (amount1, amount0);
      require(amountA >= amountAMin, 'UniswapV2Router: INSUFFICIENT_A_AMOUNT');
      require(amountB >= amountBMin, 'UniswapV2Router: INSUFFICIENT_B_AMOUNT');
  }
  function removeLiquidityETH(
      address token,
      uint liquidity,
      uint amountTokenMin,
      uint amountETHMin,
      address to,
      uint deadline
  ) public virtual override ensure(deadline) returns (uint amountToken, uint amountETH) {
      (amountToken, amountETH) = removeLiquidity(
          token,
          WETH,
          liquidity,
          amountTokenMin,
          amountETHMin,
          address(this),
          deadline
      );
      TransferHelper.safeTransfer(token, to, amountToken);
      IWETH(WETH).withdraw(amountETH);
      TransferHelper.safeTransferETH(to, amountETH);
  }
  function removeLiquidityWithPermit(
      address tokenA,
      address tokenB,
      uint liquidity,
      uint amountAMin,
      uint amountBMin,
      address to,
      uint deadline,
      bool approveMax, uint8 v, bytes32 r, bytes32 s
  ) external virtual override returns (uint amountA, uint amountB) {
      address pair = UniswapV2Library.pairFor(factory, tokenA, tokenB);
      uint value = approveMax ? uint(-1) : liquidity;
      IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
      (amountA, amountB) = removeLiquidity(tokenA, tokenB, liquidity, amountAMin, amountBMin, to, deadline);
  }
  function removeLiquidityETHWithPermit(
      address token,
      uint liquidity,
      uint amountTokenMin,
      uint amountETHMin,
      address to,
      uint deadline,
      bool approveMax, uint8 v, bytes32 r, bytes32 s
  ) external virtual override returns (uint amountToken, uint amountETH) {
      address pair = UniswapV2Library.pairFor(factory, token, WETH);
      uint value = approveMax ? uint(-1) : liquidity;
      IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
      (amountToken, amountETH) = removeLiquidityETH(token, liquidity, amountTokenMin, amountETHMin, to, deadline);
  }

  // **** REMOVE LIQUIDITY (supporting fee-on-transfer tokens) ****
  function removeLiquidityETHSupportingFeeOnTransferTokens(
      address token,
      uint liquidity,
      uint amountTokenMin,
      uint amountETHMin,
      address to,
      uint deadline
  ) public virtual override ensure(deadline) returns (uint amountETH) {
      (, amountETH) = removeLiquidity(
          token,
          WETH,
          liquidity,
          amountTokenMin,
          amountETHMin,
          address(this),
          deadline
      );
      TransferHelper.safeTransfer(token, to, IERC20(token).balanceOf(address(this)));
      IWETH(WETH).withdraw(amountETH);
      TransferHelper.safeTransferETH(to, amountETH);
  }
  function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
      address token,
      uint liquidity,
      uint amountTokenMin,
      uint amountETHMin,
      address to,
      uint deadline,
      bool approveMax, uint8 v, bytes32 r, bytes32 s
  ) external virtual override returns (uint amountETH) {
      address pair = UniswapV2Library.pairFor(factory, token, WETH);
      uint value = approveMax ? uint(-1) : liquidity;
      IUniswapV2Pair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
      amountETH = removeLiquidityETHSupportingFeeOnTransferTokens(
          token, liquidity, amountTokenMin, amountETHMin, to, deadline
      );
  }

  // **** SWAP ****
  // requires the initial amount to have already been sent to the first pair
  function _swap(
    uint256[] memory amounts,
    address[] memory path,
    address _to
  ) internal virtual {
    for (uint256 i; i < path.length - 1; i++) {
      (address input, address output) = (path[i], path[i + 1]);
      (address token0, ) = UniswapV2Library.sortTokens(input, output);
      uint256 amountOut = amounts[i + 1];
      (uint256 amount0Out, uint256 amount1Out) = input == token0
        ? (uint256(0), amountOut)
        : (amountOut, uint256(0));
      address to = i < path.length - 2
        ? UniswapV2Library.pairFor(factory, output, path[i + 2])
        : _to;
      IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output)).swap(
        amount0Out,
        amount1Out,
        to,
        new bytes(0)
      );
    }
  }

  function div(uint256 a, uint256 b) internal pure returns (uint256) {
    require(b > 0, "SafeMath: division by zero");
    return a / b;
  }

  //0x375734d9 swapExactTokensForTokens(address,uint256,uint256,address[],address,uint256)
  //0x22b58410 swapTokensForExactTokens(address,uint256,uint256,address[],address,uint256)
  //0x7ff36ab5 swapExactETHForTokens(uint256,address[],address,uint256)
  //0xfa3219d5 swapTokensForExactETH(address,uint256,uint256,address[],address,uint256)
  //0x9c91fcb5 swapExactTokensForETH(address,uint256,uint256,address[],address,uint256)
  //0xb05f579e swapETHForExactTokens(address,uint256,address[],address,uint256)
  //0xb1ca4936 swapExactTokensForTokensSupportingFeeOnTransferTokens(address,uint256,uint256,address[],address,uint256)
  //0xb6f9de95 swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)
  //0x5cae0310 swapExactTokensForETHSupportingFeeOnTransferTokens(address,uint256,uint256,address[],address,uint256)

  function batchSwap(
    Swap[] memory swap,
    uint8[] memory v,
    bytes32[] memory r,
    bytes32[] memory s
  ) public returns (uint256[] memory amounts) {
    require(
      Vault(vault).getDeposit() >= reimbursementAmount * swap.length,
      "360Router: Not enough deposit"
    );
    bytes32 txHash;
    bool success;
    for (uint256 i = 0; i < swap.length; i++) {
      require(
        swap[i].availableFrom < now,
        "360Router: False start"
      );
    }
    for (uint256 i = 0; i < swap.length; i++) {
      success = false;
      txHash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, _generateHashedMessage(swap[i])));
      require(     
        ecrecover(txHash, v[i], r[i], s[i]) == swap[i].txOwner,
        "360Router: Invalid batch tx"
      );
      if(!recorder.isDisabledTx(txHash, swap[i].txOwner) && recorder.validate(txHash)) {
        if(swap[i].nonce == nonces[swap[i].txOwner]++) {
          if(swap[i].functionSelector == 0x375734d9) {
            (success,) = address(this).delegatecall(
              abi.encodeWithSignature(
                "swapExactTokensForTokens(address,uint256,uint256,address[],address,uint256)",
                swap[i].txOwner,
                swap[i].amountIn,
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          }
        }
      }
      emit SwapEvent(recorder.currentRound(), i, swap[i].txOwner, swap[i].nonce, success);
      recorder.goForward();
    }
  }

  function disableTxHash(bytes32 _txHash) public {
    nonces[msg.sender]++;
    recorder.disableTxHash(_txHash);
  }

  function claim(
    uint256 round,
    uint256 order,
    bytes32 proofHash,
    Swap memory swap,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) public {
    //claim 성공하면 token은 txowner 에게 전달되어야함
    bytes32 txHash = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, _generateHashedMessage(swap)));
    require(
      !recorder.reimbursedTxHashes(txHash),
      "360Router: Reimbursed TX!!"
    );
    bytes32 resultHash;
    for (uint256 i = 0; i < order; i++) {
      resultHash = keccak256(abi.encodePacked(resultHash,recorder.roundTxHashes(round, i)));
    }
    require(
      recorder.roundTxHashes(round, order) != txHash || proofHash != resultHash || recorder.skippedTxHashes(txHash),
      "360Router: No trace!!"
    );

    bytes32 txMIMC = Mimc.hash(
      swap.txOwner,
      swap.functionSelector,
      swap.amountIn,
      swap.amountOut,
      swap.path,
      swap.to,
      swap.nonce,
      swap.deadline
    );
    bytes32 digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, keccak256(abi.encode(CLAIMDOMAIN_TYPEHASH, round, order, txMIMC, txHash, proofHash))));
    require(
      ecrecover(digest, v, r, s) == operator,
      "360Router: Claim is not accepted. Check signature"
    );
    Vault(vault).withdraw(swap.txOwner, reimbursementAmount);
    recorder.setReimbursedTxHashes(txHash);
  }

  function swapExactTokensForTokens(
    address origin,
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  )
    external
    virtual
    override
    ensure(deadline)
    returns (uint256[] memory amounts)
  {
    amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
    // The code below will be used for receiving fees
    //amounts = UniswapV2Library.getAmountsOut(factory, amountIn-div(amountIn,2000), path);
    require(
      amounts[amounts.length - 1] >= amountOutMin,
      "360Router: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    // The code below will be used for receiving fees
    // TransferHelper.safeTransferFrom(
    //   path[0],
    //   origin,
    //   feeTo,
    //   div(amountIn,20)
    // );
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      UniswapV2Library.pairFor(factory, path[0], path[1]),
      amounts[0]
    );
    _swap(amounts, path, to);

    address[] memory backerPath = new address[](4);
    backerPath[0] = path[1];
    backerPath[1] = path[0];
    backerPath[2] = middleAddress;
    backerPath[3] = path[1];
    
    IBacker(backer).backup(amounts[1], backerPath, deadline);
    // amounts = UniswapV2Library.getAmountsOut(factory, amounts[1], backerPath);
    // if (amounts[0] < amounts[3]) {
    //   IBacker(backer).backup(amounts[0], backerPath, deadline);
    // }
  }

  function swapTokensForExactTokens(
    address origin,
    uint256 amountOut,
    uint256 amountInMax,
    address[] calldata path,
    address to,
    uint256 deadline
  )
    external
    virtual
    override
    ensure(deadline)
    returns (uint256[] memory amounts)
  {
    amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
    require(amounts[0] <= amountInMax, "360Router: EXCESSIVE_INPUT_AMOUNT");
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      UniswapV2Library.pairFor(factory, path[0], path[1]),
      amounts[0]
    );
    _swap(amounts, path, to);
  }

  function swapExactETHForTokens(
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  )
    external
    payable
    virtual
    override
    ensure(deadline)
    returns (uint256[] memory amounts)
  {
    require(path[0] == WETH, "360Router: INVALID_PATH");
    amounts = UniswapV2Library.getAmountsOut(factory, msg.value, path);
    require(
      amounts[amounts.length - 1] >= amountOutMin,
      "360Router: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    IWETH(WETH).deposit{ value: amounts[0] }();
    assert(
      IWETH(WETH).transfer(
        UniswapV2Library.pairFor(factory, path[0], path[1]),
        amounts[0]
      )
    );
    _swap(amounts, path, to);
  }

  function swapTokensForExactETH(
    address origin,
    uint256 amountOut,
    uint256 amountInMax,
    address[] calldata path,
    address to,
    uint256 deadline
  )
    external
    virtual
    override
    ensure(deadline)
    returns (uint256[] memory amounts)
  {
    require(path[path.length - 1] == WETH, "360Router: INVALID_PATH");
    amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
    require(amounts[0] <= amountInMax, "360Router: EXCESSIVE_INPUT_AMOUNT");
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      UniswapV2Library.pairFor(factory, path[0], path[1]),
      amounts[0]
    );
    _swap(amounts, path, address(this));
    IWETH(WETH).withdraw(amounts[amounts.length - 1]);
    TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
  }

  function swapExactTokensForETH(
    address origin,
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  )
    external
    virtual
    override
    ensure(deadline)
    returns (uint256[] memory amounts)
  {
    require(path[path.length - 1] == WETH, "360Router: INVALID_PATH");
    amounts = UniswapV2Library.getAmountsOut(factory, amountIn, path);
    require(
      amounts[amounts.length - 1] >= amountOutMin,
      "360Router: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      UniswapV2Library.pairFor(factory, path[0], path[1]),
      amounts[0]
    );
    _swap(amounts, path, address(this));
    IWETH(WETH).withdraw(amounts[amounts.length - 1]);
    TransferHelper.safeTransferETH(to, amounts[amounts.length - 1]);
  }

  function swapETHForExactTokens(
    address origin,
    uint256 amountOut,
    address[] calldata path,
    address to,
    uint256 deadline
  )
    external
    payable
    virtual
    override
    ensure(deadline)
    returns (uint256[] memory amounts)
  {
    require(path[0] == WETH, "360Router: INVALID_PATH");
    amounts = UniswapV2Library.getAmountsIn(factory, amountOut, path);
    require(amounts[0] <= msg.value, "360Router: EXCESSIVE_INPUT_AMOUNT");
    IWETH(WETH).deposit{ value: amounts[0] }();
    assert(
      IWETH(WETH).transfer(
        UniswapV2Library.pairFor(factory, path[0], path[1]),
        amounts[0]
      )
    );
    _swap(amounts, path, to);
    // refund dust eth, if any
    if (msg.value > amounts[0])
      TransferHelper.safeTransferETH(origin, msg.value - amounts[0]);
  }

  // **** SWAP (supporting fee-on-transfer tokens) ****
  // requires the initial amount to have already been sent to the first pair
  function _swapSupportingFeeOnTransferTokens(
    address[] memory path,
    address _to
  ) internal virtual {
    for (uint256 i; i < path.length - 1; i++) {
      (address input, address output) = (path[i], path[i + 1]);
      (address token0, ) = UniswapV2Library.sortTokens(input, output);
      IUniswapV2Pair pair = IUniswapV2Pair(UniswapV2Library.pairFor(factory, input, output));
      uint256 amountInput;
      uint256 amountOutput;
      {
        // scope to avoid stack too deep errors
        (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
        (uint256 reserveInput, uint256 reserveOutput) = input == token0
          ? (reserve0, reserve1)
          : (reserve1, reserve0);
        amountInput = IERC20(input).balanceOf(address(pair)).sub(reserveInput);
        amountOutput = UniswapV2Library.getAmountOut(
          amountInput,
          reserveInput,
          reserveOutput
        );
      }
      (uint256 amount0Out, uint256 amount1Out) = input == token0
        ? (uint256(0), amountOutput)
        : (amountOutput, uint256(0));
      address to = i < path.length - 2
        ? UniswapV2Library.pairFor(factory, output, path[i + 2])
        : _to;
      pair.swap(amount0Out, amount1Out, to, new bytes(0));
    }
  }

  function swapExactTokensForTokensSupportingFeeOnTransferTokens(
    address origin,
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external virtual override ensure(deadline) {
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      UniswapV2Library.pairFor(factory, path[0], path[1]),
      amountIn
    );
    uint256 balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
    _swapSupportingFeeOnTransferTokens(path, to);
    require(
      IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >=
        amountOutMin,
      "360Router: INSUFFICIENT_OUTPUT_AMOUNT"
    );
  }

  function swapExactETHForTokensSupportingFeeOnTransferTokens(
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external payable virtual override ensure(deadline) {
    require(path[0] == WETH, "360Router: INVALID_PATH");
    uint256 amountIn = msg.value;
    IWETH(WETH).deposit{ value: amountIn }();
    assert(
      IWETH(WETH).transfer(
        UniswapV2Library.pairFor(factory, path[0], path[1]),
        amountIn
      )
    );
    uint256 balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
    _swapSupportingFeeOnTransferTokens(path, to);
    require(
      IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >=
        amountOutMin,
      "360Router: INSUFFICIENT_OUTPUT_AMOUNT"
    );
  }

  function swapExactTokensForETHSupportingFeeOnTransferTokens(
    address origin,
    uint256 amountIn,
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external virtual override ensure(deadline) {
    require(path[path.length - 1] == WETH, "360Router: INVALID_PATH");
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      UniswapV2Library.pairFor(factory, path[0], path[1]),
      amountIn
    );
    _swapSupportingFeeOnTransferTokens(path, address(this));
    uint256 amountOut = IERC20(WETH).balanceOf(address(this));
    require(amountOut >= amountOutMin, "360Router: INSUFFICIENT_OUTPUT_AMOUNT");
    IWETH(WETH).withdraw(amountOut);
    TransferHelper.safeTransferETH(to, amountOut);
  }

  // **** LIBRARY FUNCTIONS ****
  function quote(
    uint256 amountA,
    uint256 reserveA,
    uint256 reserveB
  ) public pure virtual override returns (uint256 amountB) {
    return UniswapV2Library.quote(amountA, reserveA, reserveB);
  }

  function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
  ) public pure virtual override returns (uint256 amountOut) {
    return UniswapV2Library.getAmountOut(amountIn, reserveIn, reserveOut);
  }

  function getAmountIn(
    uint256 amountOut,
    uint256 reserveIn,
    uint256 reserveOut
  ) public pure virtual override returns (uint256 amountIn) {
    return UniswapV2Library.getAmountIn(amountOut, reserveIn, reserveOut);
  }

  function getAmountsOut(uint256 amountIn, address[] memory path)
    public
    view
    virtual
    override
    returns (uint256[] memory amounts)
  {
    return UniswapV2Library.getAmountsOut(factory, amountIn, path);
  }

  function getAmountsIn(uint256 amountOut, address[] memory path)
    public
    view
    virtual
    override
    returns (uint256[] memory amounts)
  {
    return UniswapV2Library.getAmountsIn(factory, amountOut, path);
  }
}

