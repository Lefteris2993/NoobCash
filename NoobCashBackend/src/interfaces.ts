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
}

export interface ValidateResult { 
  newInputs: TransactionInput[]; 
  usedOutputs: TransactionOutput[];
  coins: NoobCashCoins;
}

export interface NoobCashTransactionInput {
  previousOutputId: string;
  amount: NoobCashCoins;
}

export interface NoobCashTransactionOutput {
  outputId: string;
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
  block: NoobCashBlock;
}

export interface PutTransactionDTO {
  transaction: NoobCashTransaction,
}

export interface GetChainResponseDTO {
  chain: NoobCashBlock[],
}

export interface GetTransactionsResponseDTO {
  transactions: NoobCashTransaction[];
}

export interface GetBalanceResponseDTO {
  amount: NoobCashCoins;
}
