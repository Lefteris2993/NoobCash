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
    this.notMinedTransactions.push(transaction);
    if (this.notMinedTransactions.length >= configuration.blockCapacity) {
      setTimeout(() => this.mineAndAddBlock());
    } 
  }
  
  public postBlock(b: NoobCashBlock) {
    const block = Block.toBlock(b);
    if (block.previousHash !== this.blockChain[this.blockChain.length - 1].currentHash) {
      this.resolveConflict();
    }
    if(!block.validateHash() || !block.validate(this.blockChain[this.blockChain.length - 1])) {
      throw new NoobCashError('Invalid block', 400);
    }
    if (this.currentBlock !== undefined) {
      for (let i = 0; i < this.currentBlock.transactions.length; i++) {
        const found = block.transactions.find( x => x.transactionId === this.currentBlock?.transactions[i].transactionId);
        if (!found) continue;
        this.currentBlock.abortMining();
        this.currentBlock.transactions = this.currentBlock.transactions.filter( t => 
          block.transactions.find(x => x.transactionId === t.transactionId) === undefined
        );
        break;
      }
    }
    this.blockChain.push(block);
  }

  public postTransaction(amount: NoobCashCoins, receiverAddress: string): void {
    const receiver = this.nodesInfo.find( node => node.publicKey === receiverAddress);
    if (receiver === undefined) throw new NoobCashError('User not found', 400);

    const newTransaction = new Transaction(this.wallet.publicKey, receiverAddress, amount);
    newTransaction.setTransactionId();
    newTransaction.signTransaction(this.wallet.privateKey);

    this.broadcast('put', 'transactions', { transaction: newTransaction });

    this.notMinedTransactions.push(newTransaction)
    if (this.notMinedTransactions.length >= configuration.blockCapacity) {
      setTimeout(() => this.mineAndAddBlock());
    }
  }

  private async mineAndAddBlock() {
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
    
    newBlock.utxos = newUtxos;
    this.currentBlock = newBlock;
    const completed = await this.currentBlock.mine();
    if (completed) {
      this.blockChain.push(this.currentBlock);
      this.broadcast('post', 'block', { block: this.currentBlock });
      this.currentBlock = undefined;
    } else {
      this.currentBlock.transactions.forEach(x => this.notMinedTransactions.unshift(x));
      this.currentBlock = undefined;
    }
    if (this.notMinedTransactions.length >= configuration.blockCapacity) {
      setTimeout(() => this.mineAndAddBlock());
    }
  }

  private resolveConflict() {
    let maxChain = this.blockChain;
    this.nodesInfo.forEach(async node => {
      let response: AxiosResponse<{ chain: NoobCashBlockChain }, any>;
      try {
        response = await axios.get<{ chain: NoobCashBlockChain }>(`${node.url}/chain`);
      } catch (error) {
        Logger.warn(`Could not get chain from node ${node.url}`);
        console.error(error);
        return;
      }
      const nodeChain = response.data.chain;
      if (nodeChain.length <= maxChain.length) return;
      if (!this.validateChain(nodeChain)) return;
      maxChain = nodeChain;
    });
    this.blockChain = maxChain;
  }

  private validateChain(chain: NoobCashBlockChain): boolean {
    if (JSON.stringify(chain[0]) !== JSON.stringify(this.blockChain[0])) return false;
    for (let i = 0; i < chain.length - 1; ++i) {
      const prevBlock = chain[i];
      const nextBlock = chain[i+1];
      if (prevBlock.currentHash !== nextBlock.previousHash) return false;
      if (!Block.toBlock(nextBlock).validateHash()) return false;
    }
    return true;
  }

  protected async broadcast(method: 'post' | 'get' | 'put', endpoint: string, data: any) {
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
