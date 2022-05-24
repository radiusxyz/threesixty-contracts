/* eslint-disable node/no-missing-import */
/* eslint-disable no-unused-vars */
/* eslint-disable prettier/prettier */
/* eslint-disable camelcase */
import hre from "hardhat";
import { expect } from "chai";
import { Contract, Signer } from "ethers";
import { MaxUint256 } from "ethers/constants";
import * as utils from "ethers/";
import { ecsign } from "ethereumjs-util";
import { expandTo18Decimals, getApprovalDigest } from "./shared/utilities";

const TOTAL_SUPPLY = expandTo18Decimals(10000);
const TEST_AMOUNT = expandTo18Decimals(10);

describe("TexERC20", () => {
  let signer1: Signer;
  let signer2: Signer;

  let aAddress: string;
  let bAddress: string;

  let token: Contract;
  beforeEach(async () => {
    [signer1, signer2] = await hre.ethers.getSigners();

    aAddress = await signer1.getAddress();
    bAddress = await signer2.getAddress();

    const Factory__TexERC20 = await hre.ethers.getContractFactory("TexERC20");
    token = await Factory__TexERC20.deploy(TOTAL_SUPPLY);
  });

  it("name, symbol, decimals, totalSupply, balanceOf, DOMAIN_SEPARATOR, PERMIT_TYPEHASH", async () => {
    const name = await token.name();
    expect(name).to.eq("Uniswap V2");
    expect(await token.symbol()).to.eq("UNI-V2");
    expect(await token.decimals()).to.eq(18);
    expect(await token.totalSupply()).to.eq(TOTAL_SUPPLY);
    expect(await token.balanceOf(aAddress)).to.eq(TOTAL_SUPPLY);
    expect(await token.DOMAIN_SEPARATOR()).to.eq(
      utils.keccak256(
        utils.defaultAbiCoder.encode(
          ["bytes32", "bytes32", "bytes32", "uint256", "address"],
          [
            utils.keccak256(
              utils.toUtf8Bytes(
                "EIP712Domain(string name,string version,uint256 chainId,address verifyingContract)"
              )
            ),
            utils.keccak256(utils.toUtf8Bytes(name)),
            utils.keccak256(utils.toUtf8Bytes("1")),
            1,
            token.address,
          ]
        )
      )
    );
    expect(await token.PERMIT_TYPEHASH()).to.eq(
      utils.keccak256(
        utils.toUtf8Bytes(
          "Permit(address owner,address spender,uint256 value,uint256 nonce,uint256 deadline)"
        )
      )
    );
  });

  it("approve", async () => {
    await expect(token.approve(bAddress, TEST_AMOUNT))
      .to.emit(token, "Approval")
      .withArgs(aAddress, bAddress, TEST_AMOUNT);
    expect(await token.allowance(aAddress, bAddress)).to.eq(TEST_AMOUNT);
  });

  it("transfer", async () => {
    await expect(token.transfer(bAddress, TEST_AMOUNT))
      .to.emit(token, "Transfer")
      .withArgs(aAddress, bAddress, TEST_AMOUNT);

    expect(await token.balanceOf(aAddress)).to.eq(
      TOTAL_SUPPLY.sub(TEST_AMOUNT)
    );
    expect(await token.balanceOf(bAddress)).to.eq(TEST_AMOUNT);
  });

  it("transfer:fail", async () => {
    await expect(token.transfer(bAddress, TOTAL_SUPPLY.add(1))).to.be.reverted; // ds-math-sub-underflow
    await expect(token.connect(signer2).transfer(aAddress, 1)).to.be.reverted; // ds-math-sub-underflow
  });

  it("transferFrom", async () => {
    await token.approve(bAddress, TEST_AMOUNT);
    await expect(
      token.connect(signer2).transferFrom(aAddress, bAddress, TEST_AMOUNT)
    )
      .to.emit(token, "Transfer")
      .withArgs(aAddress, bAddress, TEST_AMOUNT);

    expect(await token.allowance(aAddress, bAddress)).to.eq(0);
    expect(await token.balanceOf(aAddress)).to.eq(
      TOTAL_SUPPLY.sub(TEST_AMOUNT)
    );
    expect(await token.balanceOf(bAddress)).to.eq(TEST_AMOUNT);
  });

  it("transferFrom:max", async () => {
    await token.approve(bAddress, MaxUint256);
    await expect(
      token.connect(signer2).transferFrom(aAddress, bAddress, TEST_AMOUNT)
    )
      .to.emit(token, "Transfer")
      .withArgs(aAddress, bAddress, TEST_AMOUNT);

    expect(await token.allowance(aAddress, bAddress)).to.eq(MaxUint256);
    expect(await token.balanceOf(aAddress)).to.eq(
      TOTAL_SUPPLY.sub(TEST_AMOUNT)
    );
    expect(await token.balanceOf(bAddress)).to.eq(TEST_AMOUNT);
  });

  it("permit", async () => {
    const nonce = await token.nonces(aAddress);
    const deadline = MaxUint256;
    const digest = await getApprovalDigest(
      token,
      { owner: aAddress, spender: bAddress, value: TEST_AMOUNT },
      nonce,
      deadline
    );

    const { v, r, s } = ecsign(
      Buffer.from(digest.slice(2), "hex"),
      Buffer.from(
        "ac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
        "hex"
      )
    );

    await expect(
      token.permit(
        aAddress,
        bAddress,
        TEST_AMOUNT,
        deadline,
        v,
        utils.hexlify(r),
        utils.hexlify(s)
      )
    )
      .to.emit(token, "Approval")
      .withArgs(aAddress, bAddress, TEST_AMOUNT);
    expect(await token.allowance(aAddress, bAddress)).to.eq(TEST_AMOUNT);
    expect(await token.nonces(aAddress)).to.eq(utils.bigNumberify(1));
  });
});
