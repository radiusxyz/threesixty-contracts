
pragma experimental ABIEncoderV2;
pragma solidity =0.6.6;

import "./interfaces/ITexFactory.sol";
import "./libraries/TransferHelper.sol";

import "./interfaces/ITexRouter02.sol";
import "./libraries/TexLibrary.sol";
import "./libraries/SafeMath.sol";
import "./interfaces/IERC20.sol";
import "./interfaces/IWETH.sol";

import "./Recorder.sol";
import "./Mimc.sol";

contract TexRouter02 is ITexRouter02 {
  using SafeMath for uint256;

  address public immutable override factory;
  address public immutable override WETH;

  address public immutable recorder;
  Mimc private immutable mimc;  

  address public owner;

  address public feeTo;
  address public feeToSetter;

  address public operator;
  address public operatorSetter;

  mapping(address => uint256) public nonces;

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
    uint256 deadline;
  }

  bytes32 constant EIP712DOMAIN_TYPEHASH = keccak256("EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)");
  bytes32 constant SWAPDOMAIN_TYPEHASH = keccak256("Swap(address txOwner,bytes4 functionSelector,uint256 amountIn,uint256 amountOut,address[] path,address to,uint256 nonce,uint256 deadline)");
  bytes32 public DOMAIN_SEPARATOR;

  modifier ensure(uint256 deadline) {
    require(deadline >= block.timestamp, "TexRouter: EXPIRED");
    _;
  }

  constructor(
    address _recorder,
    address _factory,
    address _WETH,
    address _feeToSetter,
    address _operatorSetter
  ) public {
    recorder = _recorder;
    factory = _factory;
    WETH = _WETH;
    feeToSetter = _feeToSetter;
    operatorSetter = _operatorSetter;
    owner = msg.sender;

    DOMAIN_SEPARATOR = _generateHashedMessage(EIP712Domain({
      name: "Tex swap",
      version: "1",
      chainId: 80001,
      verifyingContract: address(this)
    }));

    mimc = new Mimc();
  }

  receive() external payable {
    assert(msg.sender == WETH); // only accept ETH via fallback from the WETH contract
  }

  function setFeeTo(address _feeTo) external {
    require(msg.sender == feeToSetter, "Tex: FORBIDDEN");
    feeTo = _feeTo;
  }

  function setFeeToSetter(address _feeToSetter) external {
    require(msg.sender == feeToSetter || msg.sender == owner, "Tex: FORBIDDEN");
    feeToSetter = _feeToSetter;
  }

  function setOperator(address _operator) external {
    require(msg.sender == operatorSetter, "Tex: FORBIDDEN");
    operator = _operator;
  }

  function setOperatorSetter(address _operatorSetter) external {
    require(msg.sender == operatorSetter || msg.sender == owner, "Tex: FORBIDDEN");
    operatorSetter = _operatorSetter;
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
      swap.deadline
    ));
  }

  // **** ADD LIQUIDITY ****
  function _addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin
  ) internal virtual returns (uint256 amountA, uint256 amountB) {
    // create the pair if it doesn't exist yet
    if (ITexFactory(factory).getPair(tokenA, tokenB) == address(0)) {
      ITexFactory(factory).createPair(tokenA, tokenB);
    }
    (uint256 reserveA, uint256 reserveB) = TexLibrary.getReserves(
      factory,
      tokenA,
      tokenB
    );
    if (reserveA == 0 && reserveB == 0) {
      (amountA, amountB) = (amountADesired, amountBDesired);
    } else {
      uint256 amountBOptimal = TexLibrary.quote(
        amountADesired,
        reserveA,
        reserveB
      );
      if (amountBOptimal <= amountBDesired) {
        require(
          amountBOptimal >= amountBMin,
          "TexRouter: INSUFFICIENT_B_AMOUNT"
        );
        (amountA, amountB) = (amountADesired, amountBOptimal);
      } else {
        uint256 amountAOptimal = TexLibrary.quote(
          amountBDesired,
          reserveB,
          reserveA
        );
        assert(amountAOptimal <= amountADesired);
        require(
          amountAOptimal >= amountAMin,
          "TexRouter: INSUFFICIENT_A_AMOUNT"
        );
        (amountA, amountB) = (amountAOptimal, amountBDesired);
      }
    }
  }

  function addLiquidity(
    address tokenA,
    address tokenB,
    uint256 amountADesired,
    uint256 amountBDesired,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
  )
    external
    virtual
    override
    ensure(deadline)
    returns (
      uint256 amountA,
      uint256 amountB,
      uint256 liquidity
    )
  {
    (amountA, amountB) = _addLiquidity(
      tokenA,
      tokenB,
      amountADesired,
      amountBDesired,
      amountAMin,
      amountBMin
    );
    address pair = TexLibrary.pairFor(factory, tokenA, tokenB);
    TransferHelper.safeTransferFrom(tokenA, msg.sender, pair, amountA);
    TransferHelper.safeTransferFrom(tokenB, msg.sender, pair, amountB);
    liquidity = ITexPair(pair).mint(to);
  }

  function addLiquidityETH(
    address token,
    uint256 amountTokenDesired,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline
  )
    external
    payable
    virtual
    override
    ensure(deadline)
    returns (
      uint256 amountToken,
      uint256 amountETH,
      uint256 liquidity
    )
  {
    (amountToken, amountETH) = _addLiquidity(
      token,
      WETH,
      amountTokenDesired,
      msg.value,
      amountTokenMin,
      amountETHMin
    );
    address pair = TexLibrary.pairFor(factory, token, WETH);
    TransferHelper.safeTransferFrom(token, msg.sender, pair, amountToken);
    IWETH(WETH).deposit{ value: amountETH }();
    assert(IWETH(WETH).transfer(pair, amountETH));
    liquidity = ITexPair(pair).mint(to);
    // refund dust eth, if any
    if (msg.value > amountETH)
      TransferHelper.safeTransferETH(msg.sender, msg.value - amountETH);
  }

  // **** REMOVE LIQUIDITY ****
  function removeLiquidity(
    address tokenA,
    address tokenB,
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline
  )
    public
    virtual
    override
    ensure(deadline)
    returns (uint256 amountA, uint256 amountB)
  {
    address pair = TexLibrary.pairFor(factory, tokenA, tokenB);
    ITexPair(pair).transferFrom(msg.sender, pair, liquidity); // send liquidity to pair
    (uint256 amount0, uint256 amount1) = ITexPair(pair).burn(to);
    (address token0, ) = TexLibrary.sortTokens(tokenA, tokenB);
    (amountA, amountB) = tokenA == token0
      ? (amount0, amount1)
      : (amount1, amount0);
    require(amountA >= amountAMin, "TexRouter: INSUFFICIENT_A_AMOUNT");
    require(amountB >= amountBMin, "TexRouter: INSUFFICIENT_B_AMOUNT");
  }

  function removeLiquidityETH(
    address token,
    uint256 liquidity,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline
  )
    public
    virtual
    override
    ensure(deadline)
    returns (uint256 amountToken, uint256 amountETH)
  {
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
    uint256 liquidity,
    uint256 amountAMin,
    uint256 amountBMin,
    address to,
    uint256 deadline,
    bool approveMax,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external virtual override returns (uint256 amountA, uint256 amountB) {
    address pair = TexLibrary.pairFor(factory, tokenA, tokenB);
    uint256 value = approveMax ? uint256(-1) : liquidity;
    ITexPair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
    (amountA, amountB) = removeLiquidity(
      tokenA,
      tokenB,
      liquidity,
      amountAMin,
      amountBMin,
      to,
      deadline
    );
  }

  function removeLiquidityETHWithPermit(
    address token,
    uint256 liquidity,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline,
    bool approveMax,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external virtual override returns (uint256 amountToken, uint256 amountETH) {
    address pair = TexLibrary.pairFor(factory, token, WETH);
    uint256 value = approveMax ? uint256(-1) : liquidity;
    ITexPair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
    (amountToken, amountETH) = removeLiquidityETH(
      token,
      liquidity,
      amountTokenMin,
      amountETHMin,
      to,
      deadline
    );
  }

  // **** REMOVE LIQUIDITY (supporting fee-on-transfer tokens) ****
  function removeLiquidityETHSupportingFeeOnTransferTokens(
    address token,
    uint256 liquidity,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline
  ) public virtual override ensure(deadline) returns (uint256 amountETH) {
    (, amountETH) = removeLiquidity(
      token,
      WETH,
      liquidity,
      amountTokenMin,
      amountETHMin,
      address(this),
      deadline
    );
    TransferHelper.safeTransfer(
      token,
      to,
      IERC20(token).balanceOf(address(this))
    );
    IWETH(WETH).withdraw(amountETH);
    TransferHelper.safeTransferETH(to, amountETH);
  }

  function removeLiquidityETHWithPermitSupportingFeeOnTransferTokens(
    address token,
    uint256 liquidity,
    uint256 amountTokenMin,
    uint256 amountETHMin,
    address to,
    uint256 deadline,
    bool approveMax,
    uint8 v,
    bytes32 r,
    bytes32 s
  ) external virtual override returns (uint256 amountETH) {
    address pair = TexLibrary.pairFor(factory, token, WETH);
    uint256 value = approveMax ? uint256(-1) : liquidity;
    ITexPair(pair).permit(msg.sender, address(this), value, deadline, v, r, s);
    amountETH = removeLiquidityETHSupportingFeeOnTransferTokens(
      token,
      liquidity,
      amountTokenMin,
      amountETHMin,
      to,
      deadline
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
      (address token0, ) = TexLibrary.sortTokens(input, output);
      uint256 amountOut = amounts[i + 1];
      (uint256 amount0Out, uint256 amount1Out) = input == token0
        ? (uint256(0), amountOut)
        : (amountOut, uint256(0));
      address to = i < path.length - 2
        ? TexLibrary.pairFor(factory, output, path[i + 2])
        : _to;
      ITexPair(TexLibrary.pairFor(factory, input, output)).swap(
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
    bytes32 digest;
    for (uint256 i = 0; i < swap.length; i++) {
      digest = keccak256(abi.encodePacked("\x19\x01", DOMAIN_SEPARATOR, _generateHashedMessage(swap[i])));
      if(ecrecover(digest, v[i], r[i], s[i]) == swap[i].txOwner && Recorder(recorder).validate(digest, swap[i].txOwner)) {
        if(swap[i].nonce == nonces[swap[i].txOwner]++) {
          if(swap[i].functionSelector == 0x375734d9) {   
            address(this).delegatecall(
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
          } else if(swap[i].functionSelector == 0x22b58410){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapTokensForExactTokens(address,uint256,uint256,address[],address,uint256)",
                swap[i].txOwner,
                swap[i].amountIn,
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0x7ff36ab5){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapExactETHForTokens(uint256,address[],address,uint256)",
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0xfa3219d5){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapTokensForExactETH(address,uint256,uint256,address[],address,uint256)",
                swap[i].txOwner,
                swap[i].amountIn,
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0x9c91fcb5){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapExactTokensForETH(address,uint256,uint256,address[],address,uint256)",
                swap[i].txOwner,
                swap[i].amountIn,
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0xb05f579e){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapETHForExactTokens(address,uint256,address[],address,uint256)",
                swap[i].txOwner,
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0xb1ca4936){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapExactTokensForTokensSupportingFeeOnTransferTokens(address,uint256,uint256,address[],address,uint256)",
                swap[i].txOwner,
                swap[i].amountIn,
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0xb6f9de95){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapExactETHForTokensSupportingFeeOnTransferTokens(uint256,address[],address,uint256)",
                swap[i].amountOut,
                swap[i].path,
                swap[i].to,
                swap[i].deadline
              )
            );
          } else if(swap[i].functionSelector == 0x5cae0310){
            address(this).delegatecall(
              abi.encodeWithSignature(
                "swapExactTokensForETHSupportingFeeOnTransferTokens(address,uint256,uint256,address[],address,uint256)",
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
      Recorder(recorder).goForward();
    }
  }

  function disableTxHash(bytes32 _txHash) public {
    nonces[msg.sender]++;
    Recorder(recorder).disableTxHash(_txHash);
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
    bytes32 resultHash;
    for (uint256 i = 0; i < order; i++) {
      resultHash = keccak256(abi.encodePacked(resultHash | Recorder(recorder).roundTxHashes(round, i)));
    }
    require(
      Recorder(recorder).roundTxHashes(round, order) != txHash || proofHash != resultHash,
      "TexRouter: Claim is not accepted. TX hash and proof hash are available!!"
    );

    require(
      proofHash != resultHash,
      "TexRouter: Claim is not accepted. Signature is not valid"
    );
    bytes32 txMIMC = mimc.hash(
      swap.txOwner,
      swap.functionSelector,
      swap.amountIn,
      swap.amountOut,
      swap.path,
      swap.to,
      swap.nonce,
      swap.deadline
    );
    bytes32 digest = keccak256(abi.encode(round, order, proofHash, txMIMC, txHash));
    require(
      ecrecover(digest, v, r, s) == operator,
      "TexRouter: Claim is not accepted. Check signature"
    );
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
    amounts = TexLibrary.getAmountsOut(factory, amountIn-div(amountIn,2000), path);
    require(
      amounts[amounts.length - 1] >= amountOutMin,
      "TexRouter: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      feeTo,
      div(amountIn,20)
    );
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      TexLibrary.pairFor(factory, path[0], path[1]),
      amounts[0]
    );
    _swap(amounts, path, to);
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
    amounts = TexLibrary.getAmountsIn(factory, amountOut, path);
    require(amounts[0] <= amountInMax, "TexRouter: EXCESSIVE_INPUT_AMOUNT");
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      TexLibrary.pairFor(factory, path[0], path[1]),
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
    require(path[0] == WETH, "TexRouter: INVALID_PATH");
    amounts = TexLibrary.getAmountsOut(factory, msg.value, path);
    require(
      amounts[amounts.length - 1] >= amountOutMin,
      "TexRouter: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    IWETH(WETH).deposit{ value: amounts[0] }();
    assert(
      IWETH(WETH).transfer(
        TexLibrary.pairFor(factory, path[0], path[1]),
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
    require(path[path.length - 1] == WETH, "TexRouter: INVALID_PATH");
    amounts = TexLibrary.getAmountsIn(factory, amountOut, path);
    require(amounts[0] <= amountInMax, "TexRouter: EXCESSIVE_INPUT_AMOUNT");
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      TexLibrary.pairFor(factory, path[0], path[1]),
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
    require(path[path.length - 1] == WETH, "TexRouter: INVALID_PATH");
    amounts = TexLibrary.getAmountsOut(factory, amountIn, path);
    require(
      amounts[amounts.length - 1] >= amountOutMin,
      "TexRouter: INSUFFICIENT_OUTPUT_AMOUNT"
    );
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      TexLibrary.pairFor(factory, path[0], path[1]),
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
    require(path[0] == WETH, "TexRouter: INVALID_PATH");
    amounts = TexLibrary.getAmountsIn(factory, amountOut, path);
    require(amounts[0] <= msg.value, "TexRouter: EXCESSIVE_INPUT_AMOUNT");
    IWETH(WETH).deposit{ value: amounts[0] }();
    assert(
      IWETH(WETH).transfer(
        TexLibrary.pairFor(factory, path[0], path[1]),
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
      (address token0, ) = TexLibrary.sortTokens(input, output);
      ITexPair pair = ITexPair(TexLibrary.pairFor(factory, input, output));
      uint256 amountInput;
      uint256 amountOutput;
      {
        // scope to avoid stack too deep errors
        (uint256 reserve0, uint256 reserve1, ) = pair.getReserves();
        (uint256 reserveInput, uint256 reserveOutput) = input == token0
          ? (reserve0, reserve1)
          : (reserve1, reserve0);
        amountInput = IERC20(input).balanceOf(address(pair)).sub(reserveInput);
        amountOutput = TexLibrary.getAmountOut(
          amountInput,
          reserveInput,
          reserveOutput
        );
      }
      (uint256 amount0Out, uint256 amount1Out) = input == token0
        ? (uint256(0), amountOutput)
        : (amountOutput, uint256(0));
      address to = i < path.length - 2
        ? TexLibrary.pairFor(factory, output, path[i + 2])
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
      TexLibrary.pairFor(factory, path[0], path[1]),
      amountIn
    );
    uint256 balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
    _swapSupportingFeeOnTransferTokens(path, to);
    require(
      IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >=
        amountOutMin,
      "TexRouter: INSUFFICIENT_OUTPUT_AMOUNT"
    );
  }

  function swapExactETHForTokensSupportingFeeOnTransferTokens(
    uint256 amountOutMin,
    address[] calldata path,
    address to,
    uint256 deadline
  ) external payable virtual override ensure(deadline) {
    require(path[0] == WETH, "TexRouter: INVALID_PATH");
    uint256 amountIn = msg.value;
    IWETH(WETH).deposit{ value: amountIn }();
    assert(
      IWETH(WETH).transfer(
        TexLibrary.pairFor(factory, path[0], path[1]),
        amountIn
      )
    );
    uint256 balanceBefore = IERC20(path[path.length - 1]).balanceOf(to);
    _swapSupportingFeeOnTransferTokens(path, to);
    require(
      IERC20(path[path.length - 1]).balanceOf(to).sub(balanceBefore) >=
        amountOutMin,
      "TexRouter: INSUFFICIENT_OUTPUT_AMOUNT"
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
    require(path[path.length - 1] == WETH, "TexRouter: INVALID_PATH");
    TransferHelper.safeTransferFrom(
      path[0],
      origin,
      TexLibrary.pairFor(factory, path[0], path[1]),
      amountIn
    );
    _swapSupportingFeeOnTransferTokens(path, address(this));
    uint256 amountOut = IERC20(WETH).balanceOf(address(this));
    require(amountOut >= amountOutMin, "TexRouter: INSUFFICIENT_OUTPUT_AMOUNT");
    IWETH(WETH).withdraw(amountOut);
    TransferHelper.safeTransferETH(to, amountOut);
  }

  // **** LIBRARY FUNCTIONS ****
  function quote(
    uint256 amountA,
    uint256 reserveA,
    uint256 reserveB
  ) public pure virtual override returns (uint256 amountB) {
    return TexLibrary.quote(amountA, reserveA, reserveB);
  }

  function getAmountOut(
    uint256 amountIn,
    uint256 reserveIn,
    uint256 reserveOut
  ) public pure virtual override returns (uint256 amountOut) {
    return TexLibrary.getAmountOut(amountIn, reserveIn, reserveOut);
  }

  function getAmountIn(
    uint256 amountOut,
    uint256 reserveIn,
    uint256 reserveOut
  ) public pure virtual override returns (uint256 amountIn) {
    return TexLibrary.getAmountIn(amountOut, reserveIn, reserveOut);
  }

  function getAmountsOut(uint256 amountIn, address[] memory path)
    public
    view
    virtual
    override
    returns (uint256[] memory amounts)
  {
    return TexLibrary.getAmountsOut(factory, amountIn, path);
  }

  function getAmountsIn(uint256 amountOut, address[] memory path)
    public
    view
    virtual
    override
    returns (uint256[] memory amounts)
  {
    return TexLibrary.getAmountsIn(factory, amountOut, path);
  }
}

