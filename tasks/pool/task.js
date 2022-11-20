const WFILJson = require("../../deployments/wallaby/WFIL.json");
const sFILJson = require("../../deployments/wallaby/sFIL.json");
const PoolJson = require("../../deployments/wallaby/Pool.json");
const WFILAddr = WFILJson.address;
const sFILAddr = sFILJson.address;
const PoolAddr = PoolJson.address;
const fa = require("@glif/filecoin-address");
const util = require("util");

const request = util.promisify(require("request"));


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

task("init", "")
.setAction(async () => {
  const accounts = await ethers.getSigners();
  const from = accounts[0];

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(from.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  const Pool = await ethers.getContractFactory("Pool");
  const Pool_Contract = new ethers.Contract(PoolAddr, Pool.interface, from)
  
  const tx = await Pool_Contract.init(WFILAddr, sFILAddr, {
    gasLimit:1000000000,
    maxPriorityFeePerGas: priorityFee,
    nonce:nonce,
  });

})

task("supply", "")
.addParam("idx", "")
.addParam("amount", "")
.setAction(async (taskArgs) => {
  const amount = taskArgs.amount;
  const accounts = await ethers.getSigners();
  const from = accounts[taskArgs.idx];

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(from.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  const Pool = await ethers.getContractFactory("Pool");
  const Pool_Contract = new ethers.Contract(PoolAddr, Pool.interface, from)

  const WFIL = await ethers.getContractFactory("WFIL");
  const WFIL_Contract = new ethers.Contract(WFILAddr, WFIL.interface, from)

  const sFIL = await ethers.getContractFactory("sFIL");
  const sFIL_Contract = new ethers.Contract(sFILAddr, sFIL.interface, from)
  const decimals = await WFIL_Contract.decimals();

  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, 
              await sFIL_Contract.balanceOf(from.address)/10**decimals);

  const tx = await Pool_Contract.supply(WFILAddr, 
                                        ethers.utils.parseEther(amount.toString()), 
                                        from.address,
                                        {gasLimit:1000000000,
                                         maxPriorityFeePerGas: priorityFee,
                                         nonce:nonce,}
                                        );

  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, 
  await sFIL_Contract.balanceOf(from.address)/10**decimals);
                          

})

task("pwithdraw", "")
.addParam("idx", "")
.addParam("amount", "")
.setAction(async (taskArgs) => {
  const amount = taskArgs.amount;
  const accounts = await ethers.getSigners();
  const from = accounts[taskArgs.idx];

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(from.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  const Pool = await ethers.getContractFactory("Pool");
  const Pool_Contract = new ethers.Contract(PoolAddr, Pool.interface, from)
  
  const WFIL = await ethers.getContractFactory("WFIL");
  const WFIL_Contract = new ethers.Contract(WFILAddr, WFIL.interface, from)

  const sFIL = await ethers.getContractFactory("sFIL");
  const sFIL_Contract = new ethers.Contract(sFILAddr, sFIL.interface, from)
  const decimals = await WFIL_Contract.decimals();

  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, 
              await sFIL_Contract.balanceOf(from.address)/10**decimals);


  const tx = await Pool_Contract.withdraw(WFILAddr, 
                                        ethers.utils.parseEther(amount.toString()), 
                                        from.address,
                                        {gasLimit:1000000000,
                                         maxPriorityFeePerGas: priorityFee,
                                         nonce:nonce,}
                                        );

  console.log(await WFIL_Contract.balanceOf(from.address)/10**decimals, 
  await sFIL_Contract.balanceOf(from.address)/10**decimals);

                                        
})

module.exports = {}