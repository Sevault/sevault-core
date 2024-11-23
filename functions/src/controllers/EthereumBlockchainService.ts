// @ts-nocheck
import {
  Request,
  Response
} from 'express'

import axios from 'axios'
const Web3 = require('web3')

// switch to web3js- simplicity and practicality 

import { ethers } from 'ethers'
import { USDT } from '../ERC20/USDT'
import { WBGL } from '../ERC20/WBGL'
import { BGLPriceInfo } from './BitgesellBlockchainService'

export interface IEVMBlockchainService {
  rpcUrl: string
  unit: 'BNB' | 'ETH'
  chainName: 'Ethereum' | 'BNB Smart Chain'
  chainId: string | number
  usdtContractAddress: string,
  usdtFeeAddress: string
}

const DEBUG = false
const USDT_ADDRESS = DEBUG ? '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' : '0xdAC17F958D2ee523a2206206994597C13D831ec7'

// implement fees later- make wallet non-custodial
const config = {
  rpcUrl: DEBUG ? 'https://sepolia.drpc.org' : 'https://mainnet.infura.io/v3/04c3f6b3201b41ef8a15e7e08a7c730e',
  feePercentage: 1.33,
  unit: 'ETH',
  chainName: 'Ethereum Mainnet',
  chainId: '0x1',
  feeAddress: DEBUG ? '' : '0x05703ebb0cb843cd392e22866a759b04ddcd0787',
  usdtContractAddress: USDT_ADDRESS,
  usdtFeeAddress: DEBUG ? '0xaA8E23Fb1079EA71e0a56F48a2aA51851D8433D0' : '0xe8931e29af87d9c65476aba80cff2e8d074c95ed',
  wbglAddress: '0x2ba64efb7a4ec8983e22a49c81fa216ac33f383a'
}

// const web3 = new Web3('https://mainnet.infura.io/v3/04c3f6b3201b41ef8a15e7e08a7c730e') // replace with an highly Ethereum available low latency rpc
const web3 = new Web3(config.rpcUrl) // replace with an highly Ethereum available low latency rpc

const USDT_ABI = [{ "constant": true, "inputs": [], "name": "name", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_upgradedAddress", "type": "address" }], "name": "deprecate", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_spender", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "approve", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "deprecated", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_evilUser", "type": "address" }], "name": "addBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_from", "type": "address" }, { "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transferFrom", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "upgradedAddress", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "balances", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "decimals", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "maximumFee", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "_totalSupply", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "unpause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_maker", "type": "address" }], "name": "getBlackListStatus", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }, { "name": "", "type": "address" }], "name": "allowed", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "paused", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "who", "type": "address" }], "name": "balanceOf", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [], "name": "pause", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "getOwner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "owner", "outputs": [{ "name": "", "type": "address" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "symbol", "outputs": [{ "name": "", "type": "string" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_to", "type": "address" }, { "name": "_value", "type": "uint256" }], "name": "transfer", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "newBasisPoints", "type": "uint256" }, { "name": "newMaxFee", "type": "uint256" }], "name": "setParams", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "issue", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "amount", "type": "uint256" }], "name": "redeem", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [{ "name": "_owner", "type": "address" }, { "name": "_spender", "type": "address" }], "name": "allowance", "outputs": [{ "name": "remaining", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [], "name": "basisPointsRate", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": true, "inputs": [{ "name": "", "type": "address" }], "name": "isBlackListed", "outputs": [{ "name": "", "type": "bool" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "_clearedUser", "type": "address" }], "name": "removeBlackList", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": true, "inputs": [], "name": "MAX_UINT", "outputs": [{ "name": "", "type": "uint256" }], "payable": false, "stateMutability": "view", "type": "function" }, { "constant": false, "inputs": [{ "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "constant": false, "inputs": [{ "name": "_blackListedUser", "type": "address" }], "name": "destroyBlackFunds", "outputs": [], "payable": false, "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "name": "_initialSupply", "type": "uint256" }, { "name": "_name", "type": "string" }, { "name": "_symbol", "type": "string" }, { "name": "_decimals", "type": "uint256" }], "payable": false, "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Issue", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "amount", "type": "uint256" }], "name": "Redeem", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "newAddress", "type": "address" }], "name": "Deprecate", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "feeBasisPoints", "type": "uint256" }, { "indexed": false, "name": "maxFee", "type": "uint256" }], "name": "Params", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_blackListedUser", "type": "address" }, { "indexed": false, "name": "_balance", "type": "uint256" }], "name": "DestroyedBlackFunds", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "AddedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": false, "name": "_user", "type": "address" }], "name": "RemovedBlackList", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "owner", "type": "address" }, { "indexed": true, "name": "spender", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "name": "from", "type": "address" }, { "indexed": true, "name": "to", "type": "address" }, { "indexed": false, "name": "value", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Pause", "type": "event" }, { "anonymous": false, "inputs": [], "name": "Unpause", "type": "event" }]

const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
const usdtContract = new web3.eth.Contract(USDT_ABI, USDT_ADDRESS)

export const EthereumAccountBalanceHandler = async (req: Request, res: Response) => {
  const { privateKey } = req.body
  try {
    const wallet = new ethers.Wallet(privateKey, provider)
    const balance = await wallet.getBalance()
    const usdPrice = await _getETHPriceUSD()

    const accountBalanceEther = ethers.utils.formatEther(balance)
    const accountBalanceUSD = usdPrice * Number(accountBalanceEther)
    res.json({ balance: { balance: Number(accountBalanceEther), usd: accountBalanceUSD } })
  } catch (error) {
    res.status(400).json({ balance: null, error: `${error}` })
  }
}


export const USDTBalanceHandler = async (req: Request, res: Response) => {
  const { address } = req.body

  try {
    const balance = await usdtContract.methods.balanceOf(address).call()
    res.json({ balance: { usd: balance / 10 ** 6 } })
  } catch (error) {
    res.status(400).json({ balance: null, error: `${error}` })
  }
}

export const createHdWalletHandler = async (req: Request, res: Response) => {
  const mnemonic = ethers.utils.entropyToMnemonic(ethers.utils.randomBytes(16));
  const hdNode = ethers.utils.HDNode.fromMnemonic(mnemonic)
  const firstAccount = hdNode.derivePath("m/44'/60'/0'/0/0")

  const wallet = new ethers.Wallet(firstAccount.privateKey)

  const account = {
    address: wallet.address,
    privateKey: firstAccount.privateKey,
    index: 0,
    balance: {
      balance: 0,
      usd: 0
    },
    // use format for handling changes after send
    assets: {
      wbgl: 0,
      usdt: 0
    }
  }

  try {
    let accounts = []
    accounts.push(account)
    res.json({ accounts: accounts, success: true })
  } catch (error) {
    res.status(500).json({ success: false, error: `${error}` })
  }
}

export const importWalletFromPrivateKey = async (req: Request, res: Response) => {
  const privateKey = req.body.privateKey
  let accounts = []
  if (!privateKey) res.json({ success: false, msg: 'Invalid request' })
  const wallet = new ethers.Wallet(privateKey)

  try {
    const address = await wallet.getAddress()
    const balance = await wallet.getBalance()
    const usdPrice = await _getETHPriceUSD()

    const accountBalanceEther = ethers.utils.formatEther(balance)
    const accountBalanceUSD = usdPrice * Number(accountBalanceEther)

    const signer = new ethers.Wallet(privateKey, provider)
    const USDTContractInstance = USDT.getUSDTInstance(config.usdtContractAddress, signer)
    const USDTBalance = await USDTContractInstance.balanceOf(signer.address)

    const WBGLInstance = WBGL.getWBGLInstance(config.wbglAddress, signer)
    const [wbglBalance, bglPriceUSD] = await Promise.all([WBGLInstance.balanceOf(signer.address), _getBGLPriceUSD()])

    const wbglBalanceUSD = wbglBalance * bglPriceUSD.bglPriceUSD
    const account = {
      address: address,
      privateKey: privateKey,
      index: 0,
      balance: {
        balance: accountBalanceEther,
        usd: accountBalanceUSD
      },

      assets: {
        wbgl: wbglBalance,
        usdt: USDTBalance,
        wbglUSD: wbglBalanceUSD,
      }
    }
    accounts.push(account)
    res.json({ accounts: accounts, success: true })

  } catch (error) {
    res.status(500).json({ success: false, error: `${error}` })
  }

}

export const sendEthereumhandler = async (req: Request, res: Response) => {
  const { privateKey, to, amount } = req.body
  if (!web3.utils.isAddress(to)) return res.status(400).send({ error: 'Invalid recipient address', success: false, txHash: null });

  if (!privateKey || !to || !amount) return res.status(400).send({ error: 'Missing required fields: privateKey, to, amount', succcess: false })

  const account = web3.eth.accounts.privateKeyToAccount(privateKey)
  const address = account.address

  await _sendTransaction(address, privateKey, to, String(amount), res)
}

// should work for both BEP20 and ERC20 - port over web3js working example
export const sendUSDT = async (req: Request, res: Response) => {
  const { amount, to, privateKey } = req.body;

  if (!amount || !to || !privateKey) return res.status(400).send({ success: false, error: 'Amount, recipient, and privateKey are required' });
  if (!web3.utils.isAddress(to)) return res.status(400).send({ success: false, error: 'Invalid recipient address' });

  try {
    const account = web3.eth.accounts.privateKeyToAccount(privateKey);
    const contract = new web3.eth.Contract(USDT_ABI, USDT_ADDRESS);

    const data = contract.methods.transfer(to, web3.utils.toWei(String(amount), 'mwei')).encodeABI();

    const txCount = await web3.eth.getTransactionCount(account.address, 'pending');
    const { baseFeePerGas } = await web3.eth.getBlock("pending");
    const maxPriorityFeePerGas = web3.utils.toWei('2', 'gwei'); // Example priority fee

    const gasLimit = await web3.eth.estimateGas({
      from: account.address,
      to: USDT_ADDRESS,
      data,
    });

    // Calculate effective gas price and estimated fee in Wei
    const maxFeePerGas = web3.utils.toBN(baseFeePerGas).add(web3.utils.toBN(maxPriorityFeePerGas));
    const estimatedFeeInWei = maxFeePerGas.mul(web3.utils.toBN(gasLimit));
    const estimatedFeeInEth = web3.utils.fromWei(estimatedFeeInWei, 'ether');

    const tx = {
      from: account.address,
      to: USDT_ADDRESS,
      data,
      nonce: txCount,
      maxFeePerGas,
      maxPriorityFeePerGas,
      gas: gasLimit, // Include the estimated gas limit
      type: 2,
      // chainId: 1,
    };

    const signedTx = await account.signTransaction(tx);
    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);

    res.status(200).send({
      message: 'Transaction successful',
      txHash: receipt.transactionHash,
      fee: estimatedFeeInEth, // Include the estimated fee in the response
      success: true
    });
  } catch (error) {
    res.status(500).send({ message: 'Transaction failed', error: `${error}`, success: false });
  }
};


export const sendWBGL = async (req: Request, res: Response) => {
  const {
    privateKey,
    amount,
    to,
  } = req.body
}


/// BEGIN PRIVATE METHODS

const _getBGLPriceUSD = async () => {

  const url = `https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=5667&convert_id=1,2781,2781`;

  const res = await fetch(url)
  const info = await res.json() as BGLPriceInfo

  return {
    bglPriceUSD: info.data['5667'].quote['2781'].price,
    volumeInfo: info.data['5667'].quote['2781'],
    percentage_7d: info.data['5667'].quote['2781'].percent_change_7d
  }
}

async function _sendTransaction(senderAddress: string, privateKey: string, recipientAddress: string, amountInEther: string, res: Response) {
  const amountInWei = web3.utils.toWei(amountInEther, 'ether')
  const account = web3.eth.accounts.privateKeyToAccount(privateKey)

  const nonce = await web3.eth.getTransactionCount(senderAddress)
  const gasPrice = await web3.eth.getGasPrice() // This returns the current gas price in Wei as a convention
  const latestBlock = await web3.eth.getBlock('latest')

  const gasLimit = await web3.eth.estimateGas({
    to: recipientAddress,
    value: amountInWei,
  })

  const tx = {
    from: senderAddress,
    to: recipientAddress,
    value: amountInWei,
    gas: gasLimit,
    nonce: nonce,
    type: 2, // EIP-1559
    maxFeePerGas: web3.utils.toHex(web3.utils.toBN(latestBlock.baseFeePerGas).add(web3.utils.toBN(gasPrice))),
    maxPriorityFeePerGas: web3.utils.toHex(web3.utils.toBN(gasPrice)),
  };

  const signedTx = await web3.eth.accounts.signTransaction(tx, privateKey)

  try {
    const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction)

    const effectiveGasPrice = web3.utils.toBN(latestBlock.baseFeePerGas).add(web3.utils.toBN(gasPrice)).lt(web3.utils.toBN(tx.maxFeePerGas))
      ? web3.utils.toBN(latestBlock.baseFeePerGas).add(web3.utils.toBN(gasPrice))
      : web3.utils.toBN(tx.maxFeePerGas);

    const estimatedFeeInWei = effectiveGasPrice.mul(web3.utils.toBN(tx.gas))
    const estimatedFeeInEth = web3.utils.fromWei(estimatedFeeInWei, 'ether')

    res.json({
      amount: amountInEther,
      blockHash: result.blockHash,
      blockNumber: result.blockNumber,
      success: result.status,
      to: recipientAddress,
      from: account.address,
      // balance: balanceInEther,
      fee: estimatedFeeInEth,
      transactionHash: result.transactionHash
    })

  } catch (error) {
    res.json({ succeed: false, error: `${error}` })
    console.error('Transaction failed:', error)
  }

}


/// DEVE TEST functions
// use this as the default testnet endopoint for testing- send- + tokens
export const createTestWalletFromPrivKeyHandlerEthereum = async (req: Request, res: Response) => {
  try {

    let accounts = []

    // get this from import wallet functionality - merge the array and set index - last steps
    // test usdt- all functionality -send, balance etc using this 
    // fix usdt issues- refer to old ethers.js example
    const privateKey = '14ca82934dfc173af2adc35b199463876d18641ccfd519302088d11dc03f0e79'
    const provider = new ethers.providers.JsonRpcProvider(config.rpcUrl)
    const wallet = new ethers.Wallet(privateKey, provider)
    const address = await wallet.getAddress()
    const balance = await wallet.getBalance()
    const usdPrice = await _getETHPriceUSD()

    const accountBalanceEther = ethers.utils.formatEther(balance)
    const accountBalanceUSD = usdPrice * Number(accountBalanceEther)

    const account = {
      address: address,
      privateKey: privateKey,
      index: 0,
      balance: {
        balance: Number(accountBalanceEther),
        usd: accountBalanceUSD
      },

      assets: {
        wbgl: 0,
        usdt: 0,
        wbglUSD: 0,
      }
    }
    accounts.push(account)
    res.json({ accounts: accounts, success: true })

  } catch (error) {
    res.status(500).json({ success: false, error: `${error}` })
  }
}

//// PRIVATE Functions
async function _getETHPriceUSD() {
  const ETH_DAO_PRICE_API = 'https://api.diadata.org/v1/assetQuotation/Ethereum/0x0000000000000000000000000000000000000000'

  try {
    const ethPriceInfo = await axios.get(ETH_DAO_PRICE_API)
    return ethPriceInfo.data.Price
  } catch (error) {
    console.log(`Failed to fetch ETH DAO price:`, error)
  }
}