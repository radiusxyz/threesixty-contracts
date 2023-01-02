import { expect } from "chai";
import { Address } from "ethereumjs-util";
import { Contract, Signature } from "ethers";
import { ethers } from "hardhat";
import { TypedDataUtils } from 'ethers-eip712';

describe("TEX", function () {
    async function deploySwapFixture() {
        const provider = new ethers.providers.JsonRpcProvider(process.env.DEV_URL);
        const signer0 = new ethers.Wallet(process.env.PRIV_KEY0!, provider);
        const signer1 = new ethers.Wallet(process.env.PRIV_KEY1!, provider);
        const signer2 = new ethers.Wallet(process.env.PRIV_KEY2!, provider);

        const WETH9 = await ethers.getContractFactory("WETH9");
        const weth = await WETH9.deploy();
        await weth.deployed();
        console.log("WETH9 deployed to:", weth.address);
        
        const ERC20_1 = await ethers.getContractFactory("GLDToken");
        const erc20_1 = await ERC20_1.connect(signer1).deploy(1000000);
        await erc20_1.deployed();
        console.log("GLDToken deployed to:", erc20_1.address);
        
        const ERC20_2 = await ethers.getContractFactory("SLVRToken");
        const erc20_2 = await ERC20_2.connect(signer2).deploy(1000000);
        await erc20_2.deployed();
        console.log("SLVRToken deployed to:", erc20_2.address);
        
        const Recorder = await ethers.getContractFactory("Recorder");
        const recorder = await Recorder.deploy();
        await recorder.deployed();
        console.log("Recorder deployed to:", recorder.address);
        
        const TexFactory = await ethers.getContractFactory("TexFactory");
        const texFactory = await TexFactory.deploy(process.env.ACCOUNT0);
        await texFactory.deployed();
        console.log("TexFactory deployed to:", texFactory.address);
        console.log("FeeToSetterAddress:", process.env.ACCOUNT0);
        
        const TexRouter02 = await ethers.getContractFactory("TexRouter02");
        const texRouter02 = await TexRouter02.deploy(recorder.address, texFactory.address, weth.address, process.env.ACCOUNT0);
        await texRouter02.deployed();
        console.log("TexRouter02 deployed to:", texRouter02.address);
        await texRouter02.setFeeTo(process.env.ACCOUNT0);
        
        await texFactory.createPair(erc20_1.address, erc20_2.address);
        const pairAddress = await texFactory.getPair(erc20_1.address, erc20_2.address);
        console.log("pairAddress:", pairAddress);

        return { texFactory, texRouter02, erc20_1, erc20_2, signer0, signer1, signer2, pairAddress, provider };
    }

    describe("swap", function () {
        it("Should transfer the funds to the owner", async function () {
            const a = await deploySwapFixture();
            const domain = {
                name: 'Tex swap',
                version: '1',
                chainId: 17,
                verifyingContract: a.texRouter02.address,
            };
            const types = {
                Swap: [
                { name: 'txOwner', type: 'address' },
                { name: 'amountIn', type: 'uint256' },
                { name: 'amountOutMin', type: 'uint256' },
                { name: 'path', type: 'address[]' },
                { name: 'to', type: 'address' },
                { name: 'deadline', type: 'uint256' },
                ]
            };
            const swap: Object[] = [
                {
                    txOwner: a.signer2.address,
                    amountIn: 2500,
                    amountOutMin: 1000,
                    path: [a.erc20_2.address, a.erc20_1.address],
                    to: a.signer2.address,
                    deadline: Date.now() + 1000 * 60 * 10,
                },
                {
                    txOwner: a.signer2.address,
                    amountIn: 2500,
                    amountOutMin: 1000,
                    path: [a.erc20_2.address, a.erc20_1.address],
                    to: a.signer2.address,
                    deadline: Date.now() + 1000 * 60 * 10,
                },                
            ]
            await a.erc20_2.connect(a.signer2).transfer(a.signer1.address, 20000);
            await a.erc20_1.connect(a.signer1).approve(a.texRouter02.address, 20000);
            await a.erc20_2.connect(a.signer1).approve(a.texRouter02.address, 20000);
            await a.texRouter02.connect(a.signer1).addLiquidity(a.erc20_1.address, a.erc20_2.address, 10000, 10000, 10000, 10000, a.signer1.address, Date.now() + 1000 * 60 * 10);
            const pairContract = await ethers.getContractAt("TexPair", a.pairAddress);
            const reserves = await pairContract.getReserves();
            console.log("liquidity1 : ", reserves[0]);
            console.log("liquidity2 : ", reserves[1]);
            console.log("Fee : ", await a.erc20_2.balanceOf(a.signer0.address));
            console.log("GLD : ", await a.erc20_1.balanceOf(a.signer2.address));
            console.log("SLVR : ", await a.erc20_2.balanceOf(a.signer2.address));
            const path = [a.erc20_2.address, a.erc20_1.address]
            await a.erc20_2.connect(a.signer2).approve(a.texRouter02.address, 10000);
            //await a.texRouter02.connect(a.signer2).swapExactTokensForTokens(5000, 3000, path, a.signer2.address, Date.now() + 1000 * 60 * 10);
            const signature: string[] = [];
            const sig: Signature[] = [];
            const v: number[] = [];
            const r: string[] = [];
            const s: string[] = [];
            for (let i = 0; i < 2; i++) {
                signature[i] = await a.signer2._signTypedData(domain, types, swap[0]);
                sig[i] = ethers.utils.splitSignature(signature[i]);
                v[i] = sig[i].v;
                r[i] = sig[i].r;
                s[i] = sig[i].s;
            }
            await a.texRouter02.connect(a.signer0).batchSwap(swap, v, r, s);
            //const recoveredAddress = ethers.utils.verifyTypedData(domain, types, swap, signature);
            //console.log(recoveredAddress === a.signer2.address);
            console.log("Fee : ", await a.erc20_2.balanceOf(a.signer0.address));
            console.log("GLD : ", await a.erc20_1.balanceOf(a.signer2.address));
            console.log("SLVR : ", await a.erc20_2.balanceOf(a.signer2.address));
        });
    });
});