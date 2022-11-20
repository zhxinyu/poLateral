const contractJson = require("../../deployments/wallaby/WFIL.json");
const contractAddress = contractJson.address;
const fa = require("@glif/filecoin-address");
const util = require("util");

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


task("getBalance", "")
  .addParam("idx", "")
  .setAction(async (taskArgs) => {
    const idx = taskArgs.idx;
    const networkId = network.name;

    //Get signer information
    const accounts = await ethers.getSigners();
    const signer = accounts[idx];
    const WFIL = await ethers.getContractFactory("WFIL");
    const WFIL_Contract = new ethers.Contract(contractAddress, WFIL.interface, signer)
    // expect(await WFIL_Contract.balanceOf(signer.address)).to.equal(ownerBalance);
    const decimals = await WFIL_Contract.decimals();
  
    console.log(await WFIL_Contract.balanceOf(signer.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [signer.address, 'latest'] ))/10**decimals);
  })


task("deposit", "")
.addParam("idx", "")
.addParam("amount", "")
.setAction(async (taskArgs) => {
  const amount = taskArgs.amount;
  const accounts = await ethers.getSigners();
  const from = accounts[taskArgs.idx];

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(from.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  const WFIL = await ethers.getContractFactory("WFIL");
  const WFIL_Contract = new ethers.Contract(contractAddress, WFIL.interface, from)
  const decimals = await WFIL_Contract.decimals();
  // const prevBalance = await WFIL_Contract.balanceOf(from.address);
  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals);
  
  const tx = await WFIL_Contract.deposit({
    gasLimit:1000000000,
    maxPriorityFeePerGas: priorityFee,
    nonce:nonce,
    value:ethers.utils.parseEther(amount.toString()),
  });
  // console.log(await WFIL_Contract.balanceOf(signer.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [signer.address, 'latest'] ))/10**decimals);
  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals);
  // console.log((await WFIL_Contract.balanceOf(from.address)/10**decimals) - prevBalance, amount);
  // console.log(tx);
  // const result = BigInt(await simpleCoinContract.getBalance(account2.address)).toString();
  // console.log("Current balance is :", result);

})

task("withdraw", "")
.addParam("idx", "")
.addParam("amount", "")
.setAction(async (taskArgs) => {
  const amount = taskArgs.amount;
  const accounts = await ethers.getSigners();
  const from = accounts[taskArgs.idx];

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(from.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  const WFIL = await ethers.getContractFactory("WFIL");
  
  const WFIL_Contract = new ethers.Contract(contractAddress, WFIL.interface, from)
  const decimals = await WFIL_Contract.decimals();

  // const prevBalance = (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals;
  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals);
  const tx = await WFIL_Contract.withdraw(ethers.utils.parseEther(amount.toString()), {
    gasLimit:1000000000,
    maxPriorityFeePerGas: priorityFee,
    nonce:nonce,
  });
  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals);
  // console.log((await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals - prevBalance, amount);

})


task("transferFrom", ".")
.addParam("from", "")
.addParam("to","")
.addParam("amount", "")
.setAction(async (taskArgs) => {
  const amount = taskArgs.amount;
  const accounts = await ethers.getSigners();
  const from = accounts[taskArgs.from];
  const to = accounts[taskArgs.to];

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(from.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  const WFIL = await ethers.getContractFactory("WFIL");
  const WFIL_Contract = new ethers.Contract(contractAddress, WFIL.interface, from)
  const decimals = await WFIL_Contract.decimals();
  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals);
  console.log(await WFIL_Contract.balanceOf(to.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [to.address, 'latest'] ))/10**decimals);

  const tx = await WFIL_Contract.transferFrom(to.address, ethers.utils.parseEther(amount.toString()), {
    gasLimit:1000000000,
    maxPriorityFeePerGas: priorityFee,
    nonce:nonce
  });
  console.log(await WFIL_Contract.balanceOf(to.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [to.address, 'latest'] ))/10**decimals);
  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, (await callRpc("Filecoin.EthGetBalance", [from.address, 'latest'] ))/10**decimals);



  // console.log(tx);
  // const result = BigInt(await simpleCoinContract.getBalance(account2.address)).toString();
  // console.log("Current balance is :", result);

})


module.exports = {}