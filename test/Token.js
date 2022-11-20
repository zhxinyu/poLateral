const util = require("util");
const fa = require("@glif/filecoin-address");
const request = util.promisify(require("request"));

const { expect } = require("chai");

async function callRpc(method, params) {
  var options = {
    method: "POST",
    url: "https://wallaby.node.glif.io/rpc/v0",
    // url: "http://localhost:1234/rpc/v0",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: method,
      params: params,
      id: 1,
    }),
  };
  const res = await request(options);
  return JSON.parse(res.body).result;
}


describe("Token contract", function () {
  it("Deployment should assign the total supply of tokens to the owner", async function () {

    const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
    const [owner] = await ethers.getSigners();
    const f4Address = fa.newDelegatedEthAddress(owner.address).toString();
    const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);

    const WFILFactory = await ethers.getContractFactory("WFIL");

    const WFIL = await WFILFactory.deploy({
      gasLimit:1000000000,
      maxPriorityFeePerGas: priorityFee,
      nonce:nonce,
    });

    const ownerBalance = await WFIL.balanceOf(owner.address);
    expect(await WFIL.connect(owner.address).balanceOf()).to.equal(ownerBalance);
  });
});