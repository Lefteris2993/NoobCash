import { configuration } from "./configuration";
import { NoobCashBlock, UTXO } from "./interfaces";
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
  public utxos: UTXO[] = [];
  
  private mining = false;
  private shouldStopMining = false;

  constructor() {
    this.timestamp = Date.now();
  }

  public abortMining(): void {
    this.shouldStopMining = true;
  }

  public isMining(): boolean {
    return this.mining;
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
    newBlock.utxos = block.utxos;
    return newBlock;
  }

  public async mine() {
    Logger.warn('Mining started');
    this.mining = true;

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
        Logger.info(`Fount nonce: ${currentHash} in ${Date.now() - startTime}ms`);
        console.log(JSON.stringify({
          index: this.index,
          timestamp: this.timestamp,
          transactions: this.transactions,
          nonce: i,
          previousHash: this.previousHash,
        }))
        break;
      }
      i = (i + 1) % MY_MAX_INT;
      if (i - j > configuration.miningInterval) {
        j = i;
        await new Promise(resolve => setTimeout(resolve));
        if (this.shouldStopMining) {
          Logger.warn('Mining aborted');
          return false;
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
    if (!(currentHash.slice(0, configuration.difficulty) === zeros && currentHash === this.currentHash)) {
      console.log(JSON.stringify({
        index: this.index,
        timestamp: this.timestamp,
        transactions: this.transactions,
        nonce: this.nonce,
        previousHash: this.previousHash,
      }))
    }
    return currentHash.slice(0, configuration.difficulty) === zeros && currentHash === this.currentHash;
  }

  public validate(prevBlock: Block): boolean {
    const t1 = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      nonce: this.nonce,
      previousHash: this.previousHash,
    })
    const newUtxos = JSON.parse(JSON.stringify(prevBlock.utxos)) as UTXO[];
    this.transactions.forEach( t => {
      if (!t.verifySignature()) return false;
      const senderUtxos = newUtxos.find(x => x.owner === t?.senderAddress);
      if (!senderUtxos) return false;
      const res = t.validate(senderUtxos);
      if (!res) return false;
      senderUtxos.utxos = senderUtxos.utxos.filter(x => 
        res.usedOutputs.find( y => y.outputId === x.outputId) === undefined
      );
      t.transactionOutputs.forEach(output => {
        const receiver = newUtxos.find(x => x.owner === output.receiverAddress);
        if (!receiver) return false;
        receiver.utxos.push(output);
      });
    });
    this.utxos.forEach(x => {
      const newUtxo = newUtxos.find(y => y.owner === x.owner);
      if (!newUtxo) return false;
      const actual = x.utxos.reduce((prev, curr) => prev + curr.amount, 0);
      const expected = newUtxo.utxos.reduce((prev, curr) => prev + curr.amount, 0);
      if (actual !== expected) return false;
    })
    const t2 = JSON.stringify({
      index: this.index,
      timestamp: this.timestamp,
      transactions: this.transactions,
      nonce: this.nonce,
      previousHash: this.previousHash,
    });
    if (t1 !== t2) {
      console.log('help me!');
      console.log(t1, t2);
    }
    return true;
  }
}
