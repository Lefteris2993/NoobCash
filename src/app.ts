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
import { Logger, NoobCashError } from './utils';
import * as fs from 'fs';
import cors from 'cors';

const app = express();
app.use(cors());
const port = configuration.port;

// Write pid to file
fs.writeFileSync(`.pid${configuration.port % 10 || '10'}`, `${process.pid}`);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use((
  req: Request,
  res: Response,
  next: NextFunction
) => {
  Logger.info(`[URL]: ${req.url} [Method]: ${req.method}`)
  return next();
});

let node: NoobCashNode;

if (configuration.isBootstrap)
  node = new BootstrapNode();
else 
  node = new SimpleNode()

// An endpoint to see that the node is up and running
app.get('/healthcheck', (_, res) => {
  res.status(200).send('Up and running!\n')
});

// Initialize node, join network
app.post('/ignite', async (_: Request, res: Response) => {
  await node.ignite();
  res.status(200).send('OK\n');
});

// Receive new block
app.post('/block', async (req: Request<any, any, PostBlockDTO>, res: Response) => {
  const block = req.body.block;
  try {
    node.postBlock(block);
    res.status(200).send('OK\n');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
  }
});

// Receive new Transaction
app.put('/transactions', async (req: Request<any, any, PutTransactionDTO>, res: Response) => {
  const transaction = req.body.transaction;
  try {
    node.putTransaction(transaction);
    res.status(200).send('OK\n');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
  }
});

// Receive chain for initialization
app.post('/info', (req: Request<any, any, PostInfoDTO>, res: Response) => {
  const nodeInfo = req.body.nodesInfo;
  const block = req.body.genesisBlock;
  try {
    node.info(nodeInfo, block);
    res.status(200).send('OK\n');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
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
    res.status(error.status).send(`${error.message}\n`);
  }
});

// Get the block chain
app.get('/chain', (_: Request, res: Response<GetChainResponseDTO | string>) => {
  try {
    const result = node.getChain();
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
  }
});

// Create a new Transaction
app.post('/transactions', async (req: Request<any, any, PostTransactionDTO>, res: Response) => {
  const amount = Number(req.body.amount);
  const receiverAddress = req.body.receiverAddress;
  const receiverId = Number(req.body.receiverId);
  try {
    node.postTransaction(amount, receiverAddress, receiverId);
    res.status(200).send('OK\n');
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
  }
});

// Get list of Transactions
app.get('/transactions', (_: Request, res: Response<GetTransactionsResponseDTO | string>) => {
  try {
    const result = node.getTransactions();
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
  }
});

// Get balance
app.get('/balance', (_: Request, res: Response<GetBalanceResponseDTO | string>) => {
  try {
    const result = node.getBalance();
    res.status(200).send(result);
  } catch (e) {
    const error = e as NoobCashError;
    res.status(error.status).send(`${error.message}\n`);
  }
});

app.listen(port, () => {
  Logger.info(`NoobCash backend running on port: ${port}`);
});
