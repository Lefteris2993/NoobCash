import { configuration } from "./configuration";
import { NoobCashBlock, UTXO } from "./interfaces";
import { hash, NoobCashError } from "./utils";

export class MinerService {
  private miningBlock!: NoobCashBlock;
  private mining = false;
  private shouldAbortMining = false;

  constructor() {}

  public abortMining(): void {
    this.shouldAbortMining = true;
  }

  public isMining(): boolean {
    return this.mining;
  }

  public validateHash(block: NoobCashBlock): boolean {
    const currentHash = hash({
      index: block.index,
      timestamp: block.timestamp,
      transactions: block.transactions,
      nonce: block.nonce
    });
    const zeros = '0'.repeat(configuration.difficulty);
    return currentHash.slice(0, configuration.difficulty) === zeros;
  }

  public mineBlock(b: NoobCashBlock): Promise<NoobCashBlock | undefined> {
    throw new NoobCashError('Not implemented', 501);
  }


}