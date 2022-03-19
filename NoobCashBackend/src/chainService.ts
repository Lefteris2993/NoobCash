import PriorityQueue from "ts-priority-queue";
import { NoobCashBlock } from "./interfaces";
import { NoobCashError } from "./utils";

export class ChainService {
  private blockchain = new Map<number, NoobCashBlock[]>();
  private futureBlockQueue = new PriorityQueue<NoobCashBlock>({ 
    comparator: (a: NoobCashBlock, b: NoobCashBlock) => {
      return a.index - b.index;
  } });

  constructor() {}

  // Removes orphan blocks
  private trimBlockChain(): void {
    throw new NoobCashError('Not implemented', 501);
  }

  // Gets chain from other nodes. It is called when the current network blockchain is lost
  private syncChain(): void {
    throw new NoobCashError('Not implemented', 501);
  }

  // Adds a block heard to the blockchain
  public addBlock(b: NoobCashBlock): void {
    throw new NoobCashError('Not implemented', 501);
  }

  // Return the latest block of the blockchain
  public getLatestBlock(): NoobCashBlock {
    throw new NoobCashError('Not implemented', 501);
  }

}
