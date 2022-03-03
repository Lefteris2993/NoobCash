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

export type NoobCashBlockChain = NoobCashBlock[];

export interface NoobCashWallet {
  publicKey: string;
  privateKey: string;
  signTransaction: (transaction: NoobCashTransaction) => void;
  verifyTransaction: (transaction: NoobCashTransaction) => boolean;
}

export interface NoobCashTransaction {
  senderAddress: string;
  receiverAddress: string;
  amount: NoobCashCoins;
  transactionId: string;
  transactionInputs: NoobCashTransactionInput[];
  transactionOutputs: NoobCashTransactionOutput[];
  signature: string;
  validateTransaction: (transaction: NoobCashTransaction) => boolean;
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

export interface PostInfoData {
  chain: NoobCashBlockChain,
  utxos: UTXO[],
  nodesInfo: NodeInfo[],
}
