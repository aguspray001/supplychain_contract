const Web3 = require('web3');

const dhtLoraABI = require("../../build/contracts/DHTLoRa.json");

const BLOCKCHAIN_PORT="8545"
const BLOCKCHAIN_URI="10.0.2.15"
const PROTOCOL="http"

const web3 = new Web3();
web3.setProvider(
  new web3.providers.HttpProvider(
    `${PROTOCOL}://${BLOCKCHAIN_URI}:${BLOCKCHAIN_PORT}`
  )
);

exports.storeData = async ({nodeID, gatewayID, data, unixtime}, privateKey) => {
    let account = await web3.eth.accounts.privateKeyToAccount(privateKey);
    const chainID = await web3.eth.net.getId();
    const nonce = await web3.eth.getTransactionCount(account.address, "latest");
    const deployedNet = dhtLoraABI.networks[`${chainID}`];
    const contractAddress = deployedNet.address;

    const dhtLoraContractInstance = await new web3.eth.Contract(dhtLoraABI.abi, deployedNet.address);

    // encode ABI
    const storeData = await dhtLoraContractInstance.methods.storeData(
        //   string nodeID;
        web3.utils.toHex(nodeID),
        // string gatewayID;
        web3.utils.toHex(gatewayID),
        // string data;
        web3.utils.toHex(data),
        // uint256 unixtime;
        web3.utils.toHex(unixtime),
    );

    const estimatedGas = await storeData.estimateGas();
    const encodedABIStoreData = await storeData.encodeABI();

    const tx = {
        nonce: web3.utils.toHex(nonce),
        from: account.address,
        to: contractAddress,
        data: encodedABIStoreData,
        gas: estimatedGas * 2
    }
    
    const signedTx = await web3.eth.accounts.signTransaction(tx, account.privateKey);

    const respTx = await web3.eth.sendSignedTransaction(web3.utils.toHex(signedTx.rawTransaction));
    return respTx
}

exports.getData = async (privateKey) => {
    let account = await web3.eth.accounts.privateKeyToAccount(privateKey);
    const chainID = await web3.eth.net.getId();
    const nonce = await web3.eth.getTransactionCount(account.address, "latest");
    const deployedNet = dhtLoraABI.networks[`${chainID}`];
    const contractAddress = deployedNet.address;

    const dhtLoraContractInstance = await new web3.eth.Contract(dhtLoraABI.abi, deployedNet.address);

    await dhtLoraContractInstance.getPastEvents('DataStoredEvent', {fromBlock:0, toBlock: 'latest'}, (err, events)=>{
        if(!err){
            events.forEach(event => {
                const eventData = event.returnValue;
                console.log("event => ", eventData);
            });
        }else{
            console.log("error => ", err)
        }
    })
}