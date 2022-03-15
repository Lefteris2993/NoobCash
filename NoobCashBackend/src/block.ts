import { configuration } from "./configuration";
import { NoobCashBlock } from "./interfaces";
import { Transaction } from "./transaction";
import { hash, Logger } from "./utils";

const MY_MAX_INT = 8589934592;

export class Block implements NoobCashBlock {
  public index!: number;
  public timestamp!: number;
  public transactions: Transaction[] = [];
  public nonce!: number;
  public currentHash!: string;
  public previousHash!: string;
  
  private shouldStopMining = false;

  constructor() {
    this.timestamp = Date.now();
  }

  public abortMining() {
    this.shouldStopMining = true;
  }

  public static toBlock(block: NoobCashBlock): Block {
    const newBlock = new Block();
    newBlock.index = block.index;
    newBlock.timestamp = block.timestamp;
    block.transactions.forEach( x => {
      newBlock.transactions.push(Transaction.toTransaction(x));
    });
    newBlock.nonce = block.nonce;
    newBlock.currentHash = block.currentHash;
    newBlock.previousHash = block.previousHash;
    return newBlock;
  }

  public async mine() {
    Logger.info('Starting mining...');

    let i = Math.floor(Math.random() * MY_MAX_INT);
    const startTime = Date.now();
    const startNum = i;
    let j = i;
    let currentHash: string;
    const zeros = '0'.repeat(configuration.difficulty);
    while(true) {
      currentHash = hash({
        index: this.index,
        timestamp: this.timestamp,
        transactions: this.transactions,
        nonce: i,
        previousHash: this.previousHash,
      });
      if (currentHash.startsWith(zeros)) {
        Logger.info(currentHash, i, Date.now() - startTime, i - startNum);
        break;
      }
      i = (i + 1) % MY_MAX_INT;
      if (i - j > configuration.miningInterval) {
        j = i;
        await new Promise(resolve => setTimeout(resolve));
        if (this.shouldStopMining) {
          Logger.warn('stopped mining');
          return;
        }
      }
    }
    this.nonce = i;
    this.currentHash = currentHash;
    return true;
  }

  public validateHash(): boolean {
    const currentHash = hash({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      nonce: this.nonce,
      previousHash: this.previousHash,
    });
    const zeros = '0'.repeat(configuration.difficulty);
    return currentHash.slice(0, configuration.difficulty) === zeros && currentHash === this.currentHash;
  }
}
