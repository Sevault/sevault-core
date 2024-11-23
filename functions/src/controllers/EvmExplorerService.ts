import fetch from "node-fetch";
import { Request, Response } from 'express'
import axios from "axios";
const Web3 = require('web3')

const bscWeb3 = new Web3('https://rpc.ankr.com/bsc')

interface IBSCTransaction {
  blockNumber: string;
  blockHash: string;
  timeStamp: string;
  hash: string;
  nonce: string;
  transactionIndex: string;
  from: string;
  to: string;
  value: string;
  gas: string;
  gasPrice: string;
  input: string;
  methodId: string;
  functionName: string;
  contractAddress: string;
  cumulativeGasUsed: string;
  txreceipt_status: string;
  gasUsed: string;
  confirmations: string;
  isError: string;
}


export async function historyDataPoints7Days(req: Request, res: Response) {

  const BNB_COIN_GECKO_ENDPOINT = 'https://api.coingecko.com/api/v3/coins/binancecoin/market_chart?vs_currency=usd&days=7&precision=2'
  const ETH_COIN_GECKO_ENDPOINT = 'https://api.coingecko.com/api/v3/coins/ethereum/market_chart?vs_currency=usd&days=7&precision=2'
  const USDT_COIN_GECKO_ENDPOINT = 'https://api.coingecko.com/api/v3/coins/tether/market_chart?vs_currency=usd&days=7&precision=2';

  const options = {
    method: 'GET',
    headers: {
      accept: 'application/json',
      'x-cg-demo-api-key': process.env.DATA_POINTS_BNB as string
    }
  };

  try {

    const [bnbInfo, ethInfo, usdtInfo] = await Promise.all([
      fetch(BNB_COIN_GECKO_ENDPOINT, options),
      fetch(ETH_COIN_GECKO_ENDPOINT, options),
      fetch(USDT_COIN_GECKO_ENDPOINT, options)
    ])

    const [bnbPoints, ethPoints, usdtPoints] = await Promise.all([
      bnbInfo.json(),
      ethInfo.json(),
      usdtInfo.json()
    ])

    // @ts-ignore
    const pricePointsBNB = bnbPoints.prices
    // @ts-ignore
    const ethPriceInfo = ethPoints.prices
    // @ts-ignore
    const usdtPriceInfo = usdtPoints.prices

    res.json({
      ETH: {
        datasets: format7DLabels(ethPriceInfo),
      },
      BNB: {
        datasets: format7DLabels(pricePointsBNB),
      },
      USDT: {
        datasets: format7DLabels(usdtPriceInfo)
      },
      WBGL: {
        "labels": [
          "SUN",
          "MON",
          "TUE",
          "WED",
          "THUR",
          "FRI",
          "SAT"
        ],
        dataset: generateSigmoidValues(0.051, 0.07)
      },  // other provider
      BGL: { // plug in real values
        labels: [
          "SUN",
          "MON",
          "TUE",
          "WED",
          "THUR",
          "FRI",
          "SAT"
        ],
        dataset: generateSigmoidValues(0.054, 0.069)
      },
    })

  } catch (error) {
    res.json({ error: `${error}` })
  }
}


function format7DLabels(datapoints: Array<Array<number>>) {
  const chunks = splitArray(datapoints, 7);
  const datapoint = chunks[6];
  let _datapoints: Array<number> = [];

  datapoint.forEach(datapoint => {
    _datapoints.push(datapoint[1]);
  });

  function getWeekDates() {
    const weekDates = [];
    const today = new Date();
    const currentDay = today.getDay();

    for (let i = 0; i < 7; i++) {
      const dayDifference = -(currentDay - i);
      const newDate = new Date(today);
      newDate.setDate(today.getDate() + dayDifference)

      const dateString = newDate.toISOString()
      weekDates.push(dateString);
    }

    return weekDates;
  }

  const dateLabels = getWeekDates();

  let result = [];
  for (let i = 0; i < _datapoints.length; i++) {
    result.push({ date: dateLabels[i], value: _datapoints[i] });
  }
  const minDate = dateLabels[0]; // 7 days ago (oldest date)
  const maxDate = dateLabels[dateLabels.length - 1];
  return { points: result, min: minDate, max: maxDate }

}

function splitArray(arr: Array<Array<number>>, avgSize: number) {
  const numChunks = Math.ceil(arr.length / avgSize);
  const chunkSize = Math.floor(arr.length / numChunks);
  const remainder = arr.length % numChunks;

  const chunks = [];
  let start = 0;

  for (let i = 0; i < numChunks; i++) {
    const end = start + chunkSize + (i < remainder ? 1 : 0);
    chunks.push(arr.slice(start, end));
    start = end;
  }

  return chunks;
}

function generateSigmoidValues(min: number, max: number) {
  function sigmoid(x: number) {
    return 1 / (1 + Math.exp(-x));
  }

  // Generate 7 points between -6 and 6
  let xValues = [];
  for (let i = -6; i <= 6; i += 2) {
    xValues.push(i);
  }

  let sigmoidValues = xValues.map(x => sigmoid(x + (Math.random() - 0.5)));

  let scaledValues = sigmoidValues.map(value => min + (max - min) * value);

  let formattedValues = scaledValues.map(value => ({ value: value }));

  return formattedValues;
}



export async function BSCExplorer(req: Request, res: Response) {
  const bscScanapiKey = '7HSXHYK71TG4623GM8DNKA6XQ9WYGX1X17' // move to env secret
  // address only for now - list all transactions
  const {
    address,
  } = req.body

  try {
    const url = `https://api.bscscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${bscScanapiKey}`
    const { data } = await axios.get(url)
    const txs = data.result.map((tx: IBSCTransaction, index: number) => {
      return {

        tx_id: tx.hash,
        timestamp: tx.timeStamp,
        confirmations: tx.confirmations,
        amount: bscWeb3.utils.fromWei(tx.value, 'ether'),
        fee: bscWeb3.utils.fromWei((BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(), 'ether'),
        to: tx.to,
        from: tx.from,
        block_height: tx.blockNumber,
        coinbase: false,
        id: index
      }
    })
    res.json({ tx: txs, message: data.message, success: data.status > "0" })

  } catch (error) {
    res.json({ success: false, error: `${error}` })
  }
}

export async function ETHExplorer(req: Request, res: Response) {
  const etherscanAPI = process.env.ETHERSCAN_APIKEY
  const {
    address,
  } = req.body

  try {
    const url = `https://api.etherscan.com/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanAPI}`
    const { data } = await axios.get(url)
    const txs = data.result.map((tx: IBSCTransaction, index: number) => {
      return {

        tx_id: tx.hash,
        timestamp: tx.timeStamp,
        confirmations: tx.confirmations,
        amount: bscWeb3.utils.fromWei(tx.value, 'ether'),
        fee: bscWeb3.utils.fromWei((BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(), 'ether'),
        to: tx.to,
        from: tx.from,
        block_height: tx.blockNumber,
        coinbase: false,
        id: index
      }
    })
    res.json({ tx: txs, message: data.message, success: data.status > "0" })

  } catch (error) {
    res.json({ success: false, error: `${error}` })
  }
}

export async function ERC20Explorer(req: Request, res: Response) {
  const etherscanAPI = process.env.ETHERSCAN_APIKEY
  const USDT_ADDRESS = '0xdac17f958d2ee523a2206206994597c13d831ec7'

  const {
    address,
  } = req.body

  const url = `https://api.etherscan.com/api?module=account&action=tokentx&contractaddress=${USDT_ADDRESS}&address=${address}&page=1&offset=100&startblock=0&endblock=99999999&sort=asc&apikey=${etherscanAPI}`;
  try {
    const { data } = await axios.get(url)
    const txs = data.result.map((tx: IBSCTransaction, index: number) => {
      return {

        tx_id: tx.hash,
        timestamp: tx.timeStamp,
        confirmations: tx.confirmations,
        amount: Number(tx.value),
        fee: bscWeb3.utils.fromWei((BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(), 'ether'),
        to: tx.to,
        from: tx.from,
        block_height: tx.blockNumber,
        coinbase: false,
        id: index
      }
    })
    res.json({ tx: txs, message: data.message, success: data.status > "0" })

  } catch (error) {
    res.json({ success: false, error: `${error}` })
  }
}

export async function BEP20Explorer(req: Request, res: Response) {
  const bscsacncanAPI = process.env.BSCSAN_APIKEY
  const USDT_ADDRESS = '0x55d398326f99059ff775485246999027b3197955'
  // address only for now - list all transactions
  const {
    address,
  } = req.body

  const url = `https://api.bscscan.com/api?module=account&action=tokentx&contractaddress=${USDT_ADDRESS}&address=${address}&page=1&offset=100&startblock=0&endblock=99999999&sort=asc&apikey=${bscsacncanAPI}`;
  try {
    const { data } = await axios.get(url)
    const txs = data.result.map((tx: IBSCTransaction, index: number) => {
      return {

        tx_id: tx.hash,
        timestamp: tx.timeStamp,
        confirmations: tx.confirmations,
        amount: Number(tx.value) / 10e6,
        fee: bscWeb3.utils.fromWei((BigInt(tx.gasUsed) * BigInt(tx.gasPrice)).toString(), 'ether'),
        to: tx.to,
        from: tx.from,
        block_height: tx.blockNumber,
        coinbase: false,
        id: index
      }
    })
    res.json({ tx: txs, message: data.message, success: data.status > "0" })

  } catch (error) {
    res.json({ success: false, error: `${error}` })
  }
}

// get eth to get testnet eth for ethereum and usdt->once done, hook up everything and build for device- Fix push notifications+reactivity-> launch website landing -> launch!