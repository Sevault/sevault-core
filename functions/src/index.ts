/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

// https://stackoverflow.com/questions/76434349/firebase-cloud-functions-v2-error-when-deploying
import { onRequest } from "firebase-functions/v1/https";
import { setGlobalOptions } from "firebase-functions/v2/options";
setGlobalOptions({ maxInstances: 10 });

import express = require("express");

import cors = require("cors");

import { Request, Response } from "express";
import {
  BGLaccountBalanceHandler,
  bglTxBuilderHandler,
  createBitgesellAccountsHandler,
  dashboardHandler,
  importAccountHandler,
  importFromPkeyOrSeedPhraseHandler,
  importWalletHandler,
  txHistoryHandler,
} from './controllers/BitgesellBlockchainService';

import {
  BNBAccountBalanceHandler,
  BUSDTBalanceHandler,
  // @ts-ignore fix back after debug flag+ function port-over, merge on the frontend
  createHdWalletHandler as createBNBHDwallet,
  // createTestWalletFromPrivKeyHandler,
  sendBNBHandler,
  sendUSDT as sendUSDTHandler,
  sendWBGL as sendWBGLHandler
} from './controllers/BNBSmartChainService';

import {
  createHdWalletHandler,
  EthereumAccountBalanceHandler,
  sendEthereumhandler,
  sendUSDT,
  sendWBGL,
  USDTBalanceHandler
} from './controllers/EthereumBlockchainService';
import {
  swapBGLtoWBGLETHandler,
  swapWBGLtoBGLETHHandler
} from './controllers/WBGLBridgeService';
import { BEP20Explorer, BSCExplorer, ERC20Explorer, ETHExplorer, historyDataPoints7Days } from "./controllers/EvmExplorerService";

const app = express()
app.disable('etag')
app.set('trust proxy', true)
app.disable('x-powered-by')
app.use(express.json());

app.use(cors());

app.get("/health", (req: Request, res: Response) => {
  res.send("0k").status(200);
});

// BITGESELL ENDPOINTS
app.post('/create-bitgesell-accounts', createBitgesellAccountsHandler);
app.post('/dashboard', dashboardHandler)
app.post('/import-wallet', importWalletHandler)
app.post('/send-bgl', bglTxBuilderHandler)
app.post('/bgl/import-existing-wallet', importFromPkeyOrSeedPhraseHandler)
app.get('/bgl/tx-history/:address', txHistoryHandler)
app.post('/import-account-by-index', importAccountHandler)
app.post('/bgl/balance', BGLaccountBalanceHandler)

// END BITGESELL ENDPOINTS

const bnb = express()
bnb.use(express.json())
bnb.use(cors())
bnb.disable('etag')
bnb.set('trust proxy', true)
bnb.disable('x-powered-by')

app.use(cors());

// 1. BNB service Routes
bnb.post('/create-bnb-wallet', createBNBHDwallet)
// bnb.post('/create-bnb-wallet', createTestWalletFromPrivKeyHandler) // dev wallet for testing
bnb.post('/send-usdt', sendUSDTHandler)
bnb.post('/send', sendBNBHandler)
bnb.post('/send-wbgl', sendWBGLHandler)
bnb.post('/swap-wbgl-for-bgl', swapBGLtoWBGLETHandler)
bnb.post('/swap-bgl-for-wbgl', swapBGLtoWBGLETHandler)
bnb.post('/history', BSCExplorer)
bnb.post('/history-usdt', BEP20Explorer)
bnb.post('/balance', BNBAccountBalanceHandler)
bnb.post('/balance-usdt', BUSDTBalanceHandler)

// 3. Ethereum service Routes
app.post('/v1/eth/create-eth-wallet', createHdWalletHandler)
app.post('/v1/eth/send-usdt', sendUSDT)
app.post('/v1/eth/send', sendEthereumhandler) // @todo: port to mainnet as it works
app.post('/v1/eth/send-wbgl', sendWBGL)
app.post('/v1/eth/history', ETHExplorer)
app.post('/v1/eth/history-usdt', ERC20Explorer)
app.post('/v1/eth/balance', EthereumAccountBalanceHandler)
app.post('/v1/eth/balance-usdt', USDTBalanceHandler)

app.post('/v1/eth/swap-wbgl-for-bgl', swapBGLtoWBGLETHandler)
app.post('/v1/eth/swap-bgl-for-wbgl', swapWBGLtoBGLETHHandler)

// 2. Explorer + historical chart data
app.get('/chart-historical', historyDataPoints7Days)

exports.app = onRequest(app);
exports.bnb = onRequest(bnb)