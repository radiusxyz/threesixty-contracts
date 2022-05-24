#!/bin/bash
npm run deploy:calHash
npm run calHash
npm run deploy:weth
npm run deploy:texFactory

----
npm run deploy:recorder
npm run deploy:router
npm run factory:createPair
npm run addLiquidity
npm run getReserve

npm run recorder:state
npm run recorder:addTxId
npm run router:approve
npm run router:swapExactTokensForTokens
----

npm run deploy:recorder
npm run deploy:router
npm run recorder:state
npm run getReserve
npm run recorder:addTxId
npm run router:approve
npm run router:swapExactTokensForTokens