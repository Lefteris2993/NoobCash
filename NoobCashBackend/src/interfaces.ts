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
