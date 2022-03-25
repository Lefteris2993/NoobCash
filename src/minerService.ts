import { NoobCashBlock } from "./interfaces";
import { hash, Logger } from "./utils";

const MY_MAX_INT = 8589934592;

export class MinerService {
  private mining = false;
  private shouldAbortMining = false;
  private difficulty!: number;
  private miningInterval!: number;

  constructor(
    difficulty: number,
    miningInterval: number,
  ) {
    this.difficulty = difficulty;
    this.miningInterval = miningInterval
  }

  public abortMining(): void {
    this.shouldAbortMining = true;
  }

  public isMining(): boolean {
    return this.mining;
  }

  public async mineBlock(b: NoobCashBlock): Promise<NoobCashBlock | undefined> {
    Logger.warn('Mining started');
    this.mining = true;
    this.shouldAbortMining = false;

    let i = Math.floor(Math.random() * MY_MAX_INT);
    const startTime = Date.now();
    const startNum = i;
    let j = i;
    let currentHash: string;
    const zeros = '0'.repeat(this.difficulty);
    while(true) {
      currentHash = hash({
        index: b.index,
        timestamp: b.timestamp,
        transactions: b.transactions,
        nonce: i,
        previousHash: b.previousHash,
      });
      if (currentHash.startsWith(zeros)) {
        Logger.info(`Fount nonce: ${currentHash} in ${Date.now() - startTime}ms`);
        break;
      }
      i = (i + 1) % MY_MAX_INT;
      if (i - j > this.miningInterval) {
        j = i;
        await new Promise(resolve =>  setTimeout(resolve));
        if (this.shouldAbortMining) {
          Logger.warn('Mining aborted');
          this.mining = false;
          return;
        }
      }
    }
    this.mining = false;
    const ret: NoobCashBlock = {
      index: b.index,
      timestamp: b.timestamp,
      previousHash: b.previousHash,
      transactions: b.transactions,
      nonce: i,
      currentHash: currentHash,
      utxos: b.utxos,
    }
    return ret;     
  }
}