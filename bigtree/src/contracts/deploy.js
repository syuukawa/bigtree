const nervos = require('../nervos')
const {
  abi,
  bytecode
} = require('./compiled.js')

const transaction = require('./transaction')
let _contractAddress = ''
// contract contract instance
const myContract = new nervos.base.Contract(abi)

nervos.base.getBlockNumber().then(current => {
    transaction.validUntilBlock = +current + 88 // update transaction.validUntilBlock
    // deploy contract
    return myContract.deploy({
      data: bytecode,
      arguments: [],
    }).send(transaction)
  }).then(txRes => {
    if (txRes.hash) {
      // get transaction receipt
      return nervos.listeners.listenToTransactionReceipt(txRes.hash)
    } else {
      throw new Error("No Transaction Hash Received")
    }
  })
  .then(res => {
    const {
      contractAddress,
      errorMessage,
    } = res
    if (errorMessage) throw new Error(errorMessage)
    console.log(`contractAddress is: ${contractAddress}`)
    _contractAddress = contractAddress
    return nervos.base.storeAbi(contractAddress, abi, transaction) // store abi on the chain
  }).then(res => {
    if (res.errorMessage) throw new Error(res.errorMessage)
    return nervos.base.getAbi(_contractAddress, 'pending').then(
      res => {
      console.log(res)
      console.log(`\n\n contractAddress is: ${_contractAddress}`)
      }
    ) // get abi from the chain
  }).catch(err => console.error(err))