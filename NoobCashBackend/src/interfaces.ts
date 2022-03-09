import { Block } from "./block";
import { Transaction } from "./transaction";
import { TransactionInput } from "./transactionInput";
import { TransactionOutput } from "./transactionOutput";

export type NoobCashCoins = number;

export interface NoobCashBlock {
  index: number;
  timestamp: number;
  transactions: NoobCashTransaction[];
  nonce: number;
  currentHash: string;
  previousHash: string;
}

export type NoobCashBlockChain = Block[];

export interface NoobCashWallet {
  publicKey: string;
  privateKey: string;
}

export interface NoobCashTransaction {
  senderAddress: string;
  receiverAddress: string;
  amount: NoobCashCoins;
  transactionId: string;
  transactionInputs: NoobCashTransactionInput[];
  transactionOutputs: NoobCashTransactionOutput[];
  signature: string;
  timestamp: number;
  validate: (senderUtxos: UTXO) => ValidateResult;
}

export interface ValidateResult { 
  newInputs: TransactionInput[]; 
  usedOutputs: TransactionOutput[];
  coins: NoobCashCoins;
}

export interface NoobCashTransactionInput {
  previousOutputId: number;
  amount: NoobCashCoins;
}

export interface NoobCashTransactionOutput {
  outputId: number;
  transactionId: string;
  receiverAddress: string;
  amount: NoobCashCoins;
}

export interface NodeInfo {
  url: string;
  publicKey: string;
}

export interface UTXO {
  owner: string;
  utxo: TransactionOutput[];
}

export interface PostInfoDTO {
  chain: NoobCashBlockChain,
  utxos: UTXO[],
  nodesInfo: NodeInfo[],
}

export interface PostTransactionDTO {
  receiverAddress: string;
  amount: NoobCashCoins;
}

export interface MineResult {
  nonce: number;
  hash: string;
}

export interface PostRegisterDTO {
  nodeInfo: NodeInfo;
}

export interface PostRegisterResponseDTO { 
  nodeId: number 
}

export interface PostBlockDTO {
  block: Block;
}

export interface PutTransactionDTO {
  transaction: Transaction,
}

export interface GetChainResponseDTO {
  chain: NoobCashBlockChain,
}

export interface GetTransactionsResponseDTO {
  transactions: Transaction[];
}

export interface GetBalanceResponseDTO {
  amount: NoobCashCoins;
}
