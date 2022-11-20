const contractJson = require("../../deployments/wallaby/SimpleCoin.json");
const contractAddress = contractJson.address;
const fa = require("@glif/filecoin-address");
const util = require("util");

const request = util.promisify(require("request"));

// const DEPLOYER_PRIVATE_KEY = network.config.accounts[0];

// const account1 = new ethers.Wallet(DEPLOYER_PRIVATE_KEY);


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

task("get-balance", "Calls the simple coin Contract to read the amount of SimpleCoins owned by the account.")
  .addParam("contract", "The address the SimpleCoin contract")
  .addParam("account", "The address of the account you want the balance for")
  .setAction(async (taskArgs) => {
    const contractAddr = taskArgs.contract
    const account = taskArgs.account
    const networkId = network.name
    console.log("Reading SimpleCoin owned by", account, " on network ", networkId)
    const SimpleCoin = await ethers.getContractFactory("SimpleCoin")

    //Get signer information
    const accounts = await ethers.getSigners()
    const signer = accounts[0]


    const simpleCoinContract = new ethers.Contract(contractAddr, SimpleCoin.interface, signer)
    let result = BigInt(await simpleCoinContract.getBalance(account)).toString()
    console.log("Data is: ", result)
  })

task("transfer", "Prints an account's balance.")
.addParam("amount", "The amount to send from account 1 to account 2")
.setAction(async (taskArgs) => {
  const amount = taskArgs.amount;
  const [, account2] = await ethers.getSigners();

  const SimpleCoin = await ethers.getContractFactory("SimpleCoin");
  const simpleCoinContract = new ethers.Contract(contractAddress, SimpleCoin.interface, account1);

  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(account1.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);

  let tx = await simpleCoinContract.sendCoin(account2.address, amount, {
    gasLimit:1000000000,
    maxPriorityFeePerGas: priorityFee,
    nonce:nonce
  });

  console.log(tx);
  const result = BigInt(await simpleCoinContract.getBalance(account2.address)).toString();
  console.log("Current balance is :", result);

})




task("checkBalance", "Prints an account's balance.")
.setAction(async () => {
  const [account1, account2] = await ethers.getSigners();
  const decimal = 10**18;
  const getMyBalance = await callRpc("Filecoin.EthGetBalance", [account1.address, 'latest'] );
  const getETHMyBalance = await callRpc("eth_getBalance" ,[account1.address, 'latest']);
  const priorityFee = await callRpc("eth_maxPriorityFeePerGas");
  const f4Address = fa.newDelegatedEthAddress(account1.address).toString();
  const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);

  
  const getChainId = await callRpc("Filecoin.EthChainId" );
  // const ListDeals = await callRpc("Filecoin.ClientListDeals");
  
  // const nonce = await callRpc("Filecoin.MpoolGetNonce", [f4Address]);
  console.log((await callRpc("Filecoin.EthGetBalance", [account2.address, 'latest'] ))/decimal);

  const transaction = {
    to: account2.address, 
    value: ethers.utils.parseEther("1") ,
    gasLimit:1000000000,
    maxPriorityFeePerGas: priorityFee,
    nonce:nonce};
  const rawTransaction = await account1.sendTransaction(transaction);
  let receipt = await rawTransaction.wait()
  // const transfer = await callRpc("eth_sendRawTransaction", []);
  console.log(rawTransaction);
  console.log(receipt);
  console.log((await callRpc("Filecoin.EthGetBalance", [account2.address, 'latest'] ))/decimal);
  // console.log(getETHMyBalance/decimal, getMyBalance/decimal, getChainId/1);

})

module.exports = {}