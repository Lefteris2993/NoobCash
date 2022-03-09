import express, { NextFunction } from 'express';
import { BootstrapNode } from './bootstrapNode';
import { configuration } from './configuration';
import { NoobCashNode } from './NoobCashNode';
import { SimpleNode } from './simpleNode';
import { Request, Response } from 'express';
import { 
  GetBalanceResponseDTO, 
  GetChainResponseDTO, 
  GetTransactionsResponseDTO, 
  PostBlockDTO, 
  PostInfoDTO, 
  PostRegisterDTO, 
  PostRegisterResponseDTO, 
  PostTransactionDTO, 
  PutTransactionDTO 
} from './interfaces';
import { NoobCashError } from './utils';
import * as fs from 'fs';

const app = express();
const port = configuration.port;

// Write pid to file
fs.writeFileSync(`.pid${configuration.port % 10}`, `${process.pid}`);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.log('\x1b[32m', `[Timestamp]: ${Date.now()} [URL]: ${req.url} [Method]: ${req.method}`, '\x1b[0m');
  return next();
});

let node: NoobCashNode;

if (configuration.isBootstrap)
  node = new BootstrapNode();
else 
  node = new SimpleNode()

// An endpoint to see that the node is up and running
app.get('/healthcheck', (_, res) => {
  res.status(200).send('Up and running!')
});

// Initialize node, join network
app.post('/ignite', async (_: Request, res: Response) => {
  await node.ignite();
  res.status(200).send('OK');
});

// Receive new block
app.post('/block', (req: Request<any, any, PostBlockDTO>, res: Response) => {
  const block = req.body.block;
  try {
    node.postBlock(block);
    res.status(200).send('OK');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Receive new Transaction
app.put('/transactions', (req: Request<any, any, PutTransactionDTO>, res: Response) => {
  const transaction = req.body.transaction;
  console.log(transaction);
  try {
    node.putTransaction(transaction);
    res.status(200).send('OK');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Receive chain for initialization
app.post('/info', (req: Request<any, any, PostInfoDTO>, res: Response) => {
  const nodeInfo = req.body.nodesInfo;
  const utxos = req.body.utxos;
  const chain = req.body.chain;
  try {
    node.info(nodeInfo, utxos, chain);
    res.status(200).send('OK');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Used only on bootstrap node to register a new node
app.post('/register', (req: Request<any, any, PostRegisterDTO>, res: Response<PostRegisterResponseDTO | string>) => {
  const nodeInfo = req.body.nodeInfo;
  try {
    const result = node.register(nodeInfo);
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Get the block chain
app.get('/chain', (_: Request, res: Response<GetChainResponseDTO | string>) => {
  try {
    const result = node.getChain();
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Create a new Transaction
app.post('/transactions', (req: Request<any, any, PostTransactionDTO>, res: Response) => {
  const amount = req.body.amount;
  const receiverAddress = req.body.receiverAddress;
  try {
    node.postTransaction(amount, receiverAddress);
    res.status(200).send('OK');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Get list of Transactions
app.get('/transactions', (_: Request, res: Response<GetTransactionsResponseDTO | string>) => {
  try {
    const result = node.getTransactions();
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

// Get balance
app.get('/balance', (_: Request, res: Response<GetBalanceResponseDTO | string>) => {
  try {
    const result = node.getBalance();
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`NoobCash backend running on port: ${port}`);
});
