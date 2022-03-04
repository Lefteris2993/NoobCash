import { configuration } from "./configuration";
import { MineResult, NoobCashBlock, NoobCashTransaction } from "./interfaces";
import { hash } from "./utils";

export class Block implements NoobCashBlock {
  public index!: number;
  public timestamp!: number;
  public transactions: NoobCashTransaction[] = [];
  public nonce!: number;
  public currentHash!: string;
  public previousHash!: string;

  constructor() {
    this.timestamp = Date.now();
  }

  public async mine() {
    const minePromise = new Promise<MineResult>((resolve, reject) => {
      let i = 1;
      while(i < 2 ** 33) {
        const currentHash = hash({
          index: this.index,
          timestamp: this.timestamp,
          transactions: this.transactions,
          nonce: i,
          previousHash: this.previousHash,
        });
        const zeros = '0'.repeat(configuration.difficulty);
        if (currentHash.slice(0, configuration.difficulty) === zeros) {
          resolve({ nonce: i, hash: currentHash });
        }
      }
      reject('nonce does not exist!');
    });

    let result: MineResult = { nonce: -1, hash: '-1' };
    try {
      result = await minePromise;
    } catch (error) {
      console.error(error);
      this.timestamp = Date.now();
      this.mine();
      return;
    }

    this.nonce = result.nonce;
    this.currentHash = result.hash;
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
