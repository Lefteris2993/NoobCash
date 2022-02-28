export interface NoobCashBlock {
  index: number;
  timestamp: number;
  transactions: NoobCashTransaction[];
  nonce: number;
  currentHash: string;
  previousHash: string;
}

export interface NoobCashBlockChain {
  blocks: NoobCashBlock[];
}

export interface NoobCashWallet {
  publicKey: string;
  privateKey: string;
  signTransaction: (transaction: NoobCashTransaction) => void;
  verifyTransaction: (transaction: NoobCashTransaction) => boolean;
}

export interface NoobCashTransaction {
  senderAddress: string;
  receiverAddress: string;
  amount: number;
  transactionId: number;
  transactionInputs: any; // care
  transactionOutputs: any // care
  signature: string;
  validateTransaction: (transaction: NoobCashTransaction) => boolean;
}

export interface NoobCashTransactionInput {
  previousOutputId: number;
  amount: number;
}

export interface NoobCashTransactionOutput {
  outputId: number;
  transactionId: number;
  receiverAddress: string;
  amount: number;
}
