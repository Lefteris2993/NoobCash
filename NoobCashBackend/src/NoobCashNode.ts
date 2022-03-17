import axios, { AxiosResponse } from 'axios';
import { Block } from './block';
import { configuration } from './configuration';
import { 
  GetBalanceResponseDTO, 
  GetChainResponseDTO, 
  GetTransactionsResponseDTO, 
  NodeInfo, 
  NoobCashBlock, 
  NoobCashBlockChain, 
  NoobCashCoins, 
  NoobCashTransaction, 
  PostRegisterResponseDTO, 
  UTXO 
} from "./interfaces";
import { Transaction } from './transaction';
import { Logger, NoobCashError } from './utils';
import { Wallet } from "./wallet";

export abstract class NoobCashNode {
  protected ignited = false;
  protected wallet!: Wallet;
  protected nodeId!: number;
  protected blockChain: NoobCashBlockChain = [];
  protected nodesInfo: NodeInfo[] = [];
  protected notMinedTransactions: Transaction[] = [];
  protected currentBlock!: Block | undefined;

  constructor() {
    this.wallet = new Wallet();
  }

  public abstract ignite (): Promise<void>;
  public abstract register(nodeInfo: NodeInfo): PostRegisterResponseDTO;
  public abstract info(nodeInfo: NodeInfo[], chain: NoobCashBlockChain): void;

  public getBalance(): GetBalanceResponseDTO {
    const utxos = this.blockChain[this.blockChain.length - 1].utxos.find(x => x.owner ===  this.wallet.publicKey);
    if (!utxos) throw new NoobCashError('Internal server error', 500);
    const amount = utxos.utxos.reduce( (prev, curr) => prev + curr.amount, 0);
    return { amount: amount }
  }

  public getTransactions(): GetTransactionsResponseDTO {
    return { transactions: this.blockChain[this.blockChain.length - 1].transactions }
  }

  public getChain(): GetChainResponseDTO {
    return { chain: this.blockChain };
  }

  public putTransaction(t: NoobCashTransaction) {
    const transaction = Transaction.toTransaction(t);
    if (!transaction.verifySignature()) throw new NoobCashError('Invalid Transaction', 400);
    if (this.notMinedTransactions.find(t =>  t.transactionId === transaction.transactionId) !== undefined) return
    this.notMinedTransactions.push(transaction);
    if (this.notMinedTransactions.length >= configuration.blockCapacity) {
      setTimeout(() => this.mineAndAddBlock());
    } 
  }
  
  public async postBlock(b: NoobCashBlock) {
    const block = Block.toBlock(b);
    if (block.previousHash !== this.blockChain[this.blockChain.length - 1].currentHash) {
      const result = await this.resolveConflict();
      if (!result) return;
      this.notMinedTransactions = this.notMinedTransactions.filter(x =>
        result.mined.find(y =>  x.transactionId === y.transactionId) === undefined 
      );
      result.retry = result.retry.filter(x =>
        this.notMinedTransactions.find(y => x.transactionId === y.transactionId) === undefined 
      );
      this.notMinedTransactions.unshift(...result.retry);
      if(!this.currentBlock) return;
      this.currentBlock.abortMining();
    } else if(!block.validateHash() || !block.validate(this.blockChain[this.blockChain.length - 1])) {
      throw new NoobCashError('Invalid block', 400);
    } else if (block) {
      this.blockChain.push(block);
      if (!this.currentBlock) return;
      this.currentBlock.abortMining();
      this.currentBlock.transactions = this.currentBlock.transactions.filter( x => 
        block.transactions.find(y => x.transactionId === y.transactionId) === undefined
      );
      this.notMinedTransactions = this.notMinedTransactions.filter(x =>
        block.transactions.find(y => x.transactionId === y.transactionId) === undefined
      )
      this.notMinedTransactions.unshift(...this.currentBlock.transactions);
    }
  }

  public postTransaction(amount: NoobCashCoins, receiverAddress?: string, receiverId?: number): void {
    let receiver: NodeInfo | undefined = undefined;
    if (receiverAddress) receiver = this.nodesInfo.find( node => node.publicKey === receiverAddress);
    else if (receiverId !== undefined) receiver = this.nodesInfo[receiverId];
    if (receiver === undefined) throw new NoobCashError('User not found', 400);

    const newTransaction = new Transaction(this.wallet.publicKey, receiver.publicKey, amount);
    newTransaction.setTransactionId();
    newTransaction.signTransaction(this.wallet.privateKey);

    this.broadcast('put', 'transactions', { transaction: newTransaction });

    this.notMinedTransactions.push(newTransaction)
    if (this.notMinedTransactions.length >= configuration.blockCapacity) {
      setTimeout(() => this.mineAndAddBlock());
    }
  }

  private async mineAndAddBlock() {
    if (this.currentBlock?.isMining()) return;
    const newBlock = new Block();
    const prevBlock = this.blockChain[this.blockChain.length - 1];
    newBlock.index = prevBlock.index + 1;
    newBlock.previousHash = prevBlock.currentHash;
    
    // Create a copy in a new object
    const newUtxos = JSON.parse(JSON.stringify(prevBlock.utxos)) as UTXO[];

    while (newBlock.transactions.length !== configuration.blockCapacity) {
      const transaction = this.notMinedTransactions.shift();
      if (!transaction) {
        newBlock.transactions.forEach(x => this.notMinedTransactions.unshift(x));
        return;
      }
      const senderUtxos = newUtxos.find(x => x.owner === transaction?.senderAddress);
      if (!senderUtxos) continue;
      const res = transaction.validate(senderUtxos);
      if (!res) continue;
      senderUtxos.utxos = senderUtxos.utxos.filter(x => 
        res.usedOutputs.find( y => y.outputId === x.outputId) === undefined
      );
      transaction.transactionInputs = res.newInputs;
      transaction.transactionOutputs = transaction.calculateOutputs(res.coins);
      transaction.transactionOutputs.forEach(output => {
        const receiver = newUtxos.find(x => x.owner === output.receiverAddress);
        if (!receiver) return;
        receiver.utxos.push(output);
      });
      newBlock.transactions.push(transaction);
    }
    const i1 = JSON.stringify(newBlock.transactions[0].transactionInputs);
    newBlock.utxos = newUtxos;
    this.currentBlock = newBlock;
    const completed = await this.currentBlock.mine();
    this.currentBlock = undefined;
    if (completed && newBlock.validateHash()) {
      this.blockChain.push(newBlock);
      const i2 = JSON.stringify(newBlock.transactions[0].transactionInputs);
      console.log(i2);
      if (i1 !== i2) {
        console.log('plz help');
        console.log(i1, i2)
      }
      this.broadcast('post', 'block', { block: newBlock });
    }
    if (this.notMinedTransactions.length >= configuration.blockCapacity) {
      setTimeout(() => this.mineAndAddBlock());
    }
  }

  private async resolveConflict() {
    let maxChain = this.blockChain;
    let changed = false;
    for (const node of this.nodesInfo) {
      if (node.publicKey === this.wallet.publicKey) continue;
      let response: AxiosResponse<{ chain: NoobCashBlockChain }, any>;
      try {
        response = await axios.get<{ chain: NoobCashBlockChain }>(`${node.url}/chain`);
      } catch (error) {
        Logger.error(`Could not get chain from node ${node.url}`);
        continue;
      }
      const nodeChain = response.data.chain;
      if (nodeChain.length <= maxChain.length) {
        Logger.warn('Chain has smaller length');
        continue;
      }
      if (!this.validateChain(nodeChain)) {
        Logger.warn(`Chain invalid ${node.url}`);
        continue;
      }
      maxChain = nodeChain;
      changed = true;
    }
    let ret: { mined: Transaction[]; retry: Transaction[] } | undefined = undefined;
    if (changed) {
      let i = 0;
      while (i < maxChain.length && this.blockChain[i]?.currentHash === maxChain[i].currentHash) {
        i++;
      }
      let minedTransactions: Transaction[] = [];
      for (let j = i; j < maxChain.length; j++) {
        minedTransactions.push(...maxChain[j].transactions);
      } 
      let shouldRedoTransactions: Transaction[] = [];
      for (let j = i; j < this.blockChain.length; j++) {
        shouldRedoTransactions.push(...this.blockChain[j].transactions);        
      }
      shouldRedoTransactions = shouldRedoTransactions.filter(x =>
        minedTransactions.find(y => y.transactionId === x.transactionId) === undefined
      );
      ret = { mined: minedTransactions, retry: [] };
      console.log(ret.retry);
    }
    this.blockChain = maxChain;
    return ret;
  }

  private validateChain(chain: NoobCashBlockChain): boolean {
    if (chain[0].currentHash !== this.blockChain[0].currentHash) return false;
    for (let i = 0; i < chain.length - 1; ++i) {
      const prevBlock = Block.toBlock(chain[i]);
      const nextBlock = Block.toBlock(chain[i+1]);
      if (prevBlock.currentHash !== nextBlock.previousHash) return false;
      if (!nextBlock.validateHash()) {
        console.log(`failed: ${nextBlock.currentHash}`);
        return false;
      }
      if (!nextBlock.validate(prevBlock)) return false;
      chain[i] = prevBlock;
      chain[i+1] = nextBlock;
    }
    return true;
  }

  protected async broadcast(method: 'post' | 'get' | 'put', endpoint: string, data: any) {
    Logger.warn(`[Broadcast]: ${method} /${endpoint}`);
    try {
      await Promise.all(
        this.nodesInfo.map( node => {
          if (node.publicKey === this.wallet.publicKey) return;
          return axios(
            {
              method: method,
              url: `${node.url}/${endpoint}/`,
              data: data,
            }
          );
        })
      )
    } catch (_error) {
      // Do nothing
    }
  }
}
