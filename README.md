# Depoloy Tex with TexRouter02

### Deploy CalHash contract contract & get init code hash(Only onece)

yarn deploy:calHash

- Write the contract address to the "WETH9_CONTRACT_ADDRESS" in .env

yarn calcHah

- It needs to calcuate init code hash for using in "TexLibrary.sol"
- Update TexLibrary.sol at the line which exists comment as "// init code hash" without "0x"

### Deploy WETH contract

yarn deploy:weth

- Write the contract address to the "WETH9_CONTRACT_ADDRESS" in .env

### Deploy TexFactory contract

yarn deploy:uniswapV2Factory

- Write the contract address to the "FACTORY_CONTRACT_ADDRESS" in .env

### Deploy ERC20 contract (x2)

- Write the contract address to the "ERC20_CONTRACT_ADDRESS" and "ERC20_CONTRACT_ADDRESS2" in .env

### Deploy TexRouter02 contract

yarn deploy:router

- Write the contract address to the "ROUTER_CONTRACT_ADDRESS" in .env

### Add liqudity

yarn router:addLiquidity
