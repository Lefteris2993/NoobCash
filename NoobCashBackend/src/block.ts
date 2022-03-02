import { NoobCashBlock, NoobCashTransaction } from "./interfaces";

export class Block implements NoobCashBlock {
  public index!: number;
  public timestamp!: number;
  public transactions: NoobCashTransaction[] = [];
  public nonce!: number;
  public currentHash!: string;
  public previousHash!: string;

  public Block() {

  }
}
