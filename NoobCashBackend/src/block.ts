import { NoobCashBlock, NoobCashTransaction } from "./interfaces";

export class Block implements NoobCashBlock {
  public index!: number;
  public timestamp!: number;
  public transactions: NoobCashTransaction[] = [];
  public nonce!: number;
  public currentHash!: string;
  public previousHash!: string;

  constructor(
    index: number,
    transactions: NoobCashTransaction[],
    previousHash: string,
    nonce: number,
    currentHash: string,
  ) {
    this.index = index;
    this.timestamp = Date.now();
    this.transactions = transactions;
    this.nonce = nonce;
    this.currentHash = currentHash;
    this.previousHash = previousHash;
  }
}
