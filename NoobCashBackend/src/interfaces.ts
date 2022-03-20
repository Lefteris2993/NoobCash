import { TransactionInput } from "./transactionInput";
import { TransactionOutput } from "./transactionOutput";

export type NoobCashCoins = number;

export interface NoobCashBlock {
  index: number;
  timestamp: number;
  previousHash: string;
  transactions: NoobCashTransaction[];
  nonce: number;
  currentHash: string;
  utxos: UTXO[];
}

export interface NoobCashWallet {
  publicKey: string;
  privateKey: string;
}

export interface NoobCashTransaction {
  senderAddress: string;
  receiverAddress: string;
  amount: NoobCashCoins;
  timestamp: number;
  transactionId?: string;
  transactionInputs?: NoobCashTransactionInput[];
  transactionOutputs?: NoobCashTransactionOutput[];
  signature?: Buffer;
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
  utxos: TransactionOutput[];
}

export interface PostInfoDTO {
  genesisBlock: NoobCashBlock,
  nodesInfo: NodeInfo[],
}

export interface PostTransactionDTO {
  receiverAddress?: string;
  amount: NoobCashCoins;
  receiverId?: number;
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
