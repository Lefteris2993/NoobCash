import PriorityQueue from "ts-priority-queue";
import { configuration } from "./configuration";
import { NoobCashBlock, UTXO } from "./interfaces";
import { MinerService } from "./minerService";
import { TransactionService } from "./transactionService";
import { hash, NoobCashError } from "./utils";

export class ChainService {
  private blockchain = new Map<number, NoobCashBlock[]>();
  private futureBlockHeap = new PriorityQueue<NoobCashBlock>({ 
    comparator: (a: NoobCashBlock, b: NoobCashBlock) => {
      return a.index - b.index;
  }});
  private currentBlock!: NoobCashBlock;
  private eldestIndex!: number; 
  private transactionService!: TransactionService;
  private minerService!: MinerService;

  private maxChainLength = 42;
  private maxTimeout = 1000; //ms
  private maxIndexDiff = 5;

  constructor(
    transactionService: TransactionService,
    minerService: MinerService,
  ) {
    this.transactionService = transactionService;
    this.minerService = minerService;
  }

  // Removes orphan blocks
  private trimBlockChain(): void {
    const startIndex = this.eldestIndex;
    const finalIndex = this.currentBlock.index;
    let prevHash = this.currentBlock.currentHash;
    for (let i = finalIndex; i >= startIndex; i--) {
      const blocks = this.blockchain.get(i);
      if (!blocks) continue;
      const mainBlock = blocks.find(x => x.currentHash === prevHash);
      if (!mainBlock) throw new NoobCashError('We are screwed!', 500);
      prevHash = mainBlock.previousHash;
      const forkBlocksArray = blocks.filter(x => x.currentHash !== mainBlock.currentHash);
      const toRemoveBlocks: string[] = [];
      forkBlocksArray.forEach(b => {
        // Note: this may not be optimal..
        if (Date.now() - b.timestamp > this.maxTimeout && finalIndex - i > this.maxIndexDiff) {
          toRemoveBlocks.push(b.currentHash);
          b.transactions.forEach(t => {
            if (!t.transactionId) return;
            this.transactionService.transactionQueue.queue(t);
            const value = this.transactionService.minedTransactions.get(t.transactionId);
            if (value) {
              this.transactionService.minedTransactions.delete(t.transactionId);
              this.transactionService.minedTransactions.insert(t.transactionId, value - 1);
            }
          });
        }
      });
      const newBlocks = blocks.filter(x =>
        toRemoveBlocks.find(y => y === x.currentHash) === undefined 
      );
      this.blockchain.delete(i);
      this.blockchain.set(i, newBlocks)
    }

    if (finalIndex - startIndex > this.maxChainLength) {
      for (let i = startIndex; i < finalIndex - this.maxChainLength; i++) {
        this.blockchain.delete(i);        
      }
      this.eldestIndex = finalIndex - this.maxChainLength;
    }
  }

  // Gets chain from other nodes. It is called when the current network blockchain is lost
  private syncChain(): void {
    throw new NoobCashError('Not implemented', 501);
  }

  // Checks if some block from the queue can be added to the chain
  private checkHeap(): void {
    if (this.futureBlockHeap.length < 1) return;
    let b = this.futureBlockHeap.peek();
    if (b.index > this.currentBlock.index + 1) return;
    b = this.futureBlockHeap.dequeue();
    this.validateAndInsertBlock(b);
  }

  private validateAndInsertBlock(b: NoobCashBlock): void {
    if (!this.validateHash(b)) return;
    if (!this.validateUtxos(b)) return;

    const blockList = this.blockchain.get(b.index) || [];
    blockList.push(b);
    this.blockchain.set(b.index, blockList);
    b.transactions.forEach(t => {
      if (!t.transactionId) return;
      const prevValue = this.transactionService.minedTransactions.get(t.transactionId);
      // TODO: Not use if all of this are needed maybe test how the module works
      if (prevValue) {
        this.transactionService.minedTransactions.delete(t.transactionId);
        this.transactionService.minedTransactions.insert(t.transactionId, prevValue + 1);
      } else {
        this.transactionService.minedTransactions.insert(t.transactionId, 1);
      }
    });

    if (b.index > this.currentBlock.index) {
      this.currentBlock = b;
      this.minerService.abortMining();
      this.checkHeap();
    }
  }

  // Validates the has of a block
  private validateHash(b: NoobCashBlock): boolean {
    const currentHash = hash({
      index: b.index,
      timestamp: b.timestamp,
      transactions: b.transactions,
      nonce: b.nonce,
      previousHash: b.previousHash,
    });
    const zeros = '0'.repeat(configuration.difficulty);
    return currentHash.slice(0, configuration.difficulty) === zeros && currentHash === b.currentHash;
  }

  // Validates Transactions and utxos consistency 
  private validateUtxos(b: NoobCashBlock): boolean {
    const blocks = this.blockchain.get(b.index - 1);
    if (!blocks) return false;
    let prevBlock: NoobCashBlock | undefined = undefined;
    for (let i = 0; i < blocks.length; i++) {
      if (blocks[i].currentHash === b.previousHash) {
        prevBlock = blocks[i];
        break;
      }
    }
    if (!prevBlock) return false;

    const newUtxos = JSON.parse(JSON.stringify(prevBlock.utxos)) as UTXO[];
    b.transactions.forEach( t => {
      if (!this.transactionService.verifySignature(t)) return false;
      const senderUtxos = newUtxos.find(x => x.owner === t?.senderAddress);
      if (!senderUtxos) return false;
      const res = this.transactionService.calculateInputs(t, senderUtxos);
      if (!res) return false;
      senderUtxos.utxos = senderUtxos.utxos.filter(x => 
        res.usedOutputs.find( y => y.outputId === x.outputId) === undefined
      );
      if (!t.transactionOutputs) return false;
      t.transactionOutputs.forEach(output => {
        const receiver = newUtxos.find(x => x.owner === output.receiverAddress);
        if (!receiver) return false;
        receiver.utxos.push(output);
      });
    });
    b.utxos.forEach(x => {
      const newUtxo = newUtxos.find(y => y.owner === x.owner);
      if (!newUtxo) return false;
      const actual = x.utxos.reduce((prev, curr) => prev + curr.amount, 0);
      const expected = newUtxo.utxos.reduce((prev, curr) => prev + curr.amount, 0);
      if (actual !== expected) return false;
    });
    return true;
  }

  // Adds a block heard to the blockchain
  public addBlock(b: NoobCashBlock): void {
    if (b.index > this.currentBlock.index + 1) {
      this.futureBlockHeap.queue(b);
      return;
    }
    this.validateAndInsertBlock(b);
  }

  // Return the latest block of the blockchain
  public getLatestBlock(): NoobCashBlock {
    return this.currentBlock;
  }

  public addGenesis(b: NoobCashBlock): void {
    if (this.blockchain.size > 0) throw new NoobCashError('Invalid block', 400);
    this.blockchain.set(b.index, [b]);
    this.currentBlock = b;
    if (!b.transactions[0].transactionId) throw new NoobCashError('Invalid block', 400);
    this.transactionService.minedTransactions.insert(b.transactions[0].transactionId, 1);
    this.eldestIndex = b.index;

    setInterval(() => {
      this.trimBlockChain();
    }, 1000);
  }

}
