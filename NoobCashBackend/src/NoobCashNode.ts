import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { Block } from './block';
import { configuration } from './configuration';
import { GetBalanceResponseDTO, GetChainResponseDTO, GetTransactionsResponseDTO, NodeInfo, NoobCashBlockChain, NoobCashCoins, PostRegisterResponseDTO, UTXO } from "./interfaces";
import { Transaction } from './transaction';
import { NoobCashError } from './utils';
import { Wallet } from "./wallet";

export abstract class NoobCashNode {
  protected wallet!: Wallet;
  protected nodeId!: number;
  protected UTXOs: UTXO[] = [];
  protected blockChain: NoobCashBlockChain = [];
  protected nodesInfo: NodeInfo[] = [];
  protected currentBlock!: Block;

  constructor() {
    this.wallet = new Wallet();
    this.currentBlock = new Block();
  }

  public abstract ignite (): Promise<void>;
  public abstract register(nodeInfo: NodeInfo): PostRegisterResponseDTO;
  public abstract info(nodeInfo: NodeInfo[], utxos: UTXO[], chain: NoobCashBlockChain): void;

  public getBalance(): GetBalanceResponseDTO {
    let amount = 0;
    const utxos = this.UTXOs.find(x => x.owner ===  this.wallet.publicKey);
    if (!utxos) throw new NoobCashError('Bad request', 400);
    utxos.utxo.forEach(x => {
      amount += x.amount;
    });
    return { amount: amount }
  }

  public getTransactions(): GetTransactionsResponseDTO {
    return { transactions: this.blockChain[this.blockChain.length - 1].transactions }
  }

  public getChain(): GetChainResponseDTO {
    return { chain: this.blockChain };
  }

  public async putTransaction(transaction: Transaction) {
    if (!transaction.verifySignature()) throw new NoobCashError('Invalid Transaction', 400);
    const senderUtxos = this.UTXOs.find(x => x.owner === this.wallet.publicKey);
    if (!senderUtxos) {
      throw new NoobCashError('Bad request', 400);
    }
    transaction.validate(senderUtxos);
    if (this.currentBlock.transactions.length >= configuration.blockCapacity) {
      await this.mineAndAddBlock();
    } 
  }
  
  public postBlock(block: Block) {
    if (!(block.validateHash() && this.blockChain[this.blockChain.length - 1].currentHash === block.previousHash)) {
      this.resolveConflict();
    }
    let valid = true;
    const shouldRemoveIndexes: number[] = [];
    block.transactions.forEach(x => {
      const transactionIndex = this.currentBlock.transactions.findIndex(y => y.transactionId === x.transactionId);
      if (transactionIndex > 0) {
        shouldRemoveIndexes.push(transactionIndex);
      } else {
        valid = x.verifySignature();
      }
    });
    if (!valid) throw new NoobCashError('Invalid block', 400);
    this.blockChain.push(block);
  }

  public async postTransaction(amount: NoobCashCoins, receiverAddress: string): Promise<void> {
    const newTransaction = new Transaction(this.wallet.publicKey, receiverAddress, amount);

    const senderUtxos = this.UTXOs.find(x => x.owner === this.wallet.publicKey);
    if (!senderUtxos) {
      throw new NoobCashError('Bad request', 400);
    }

    let result = newTransaction.validate(senderUtxos);
    
    senderUtxos.utxo = senderUtxos.utxo.filter(x => 
      result.usedOutputs.find( y => y.outputId === x.outputId) === undefined
    )
  
    newTransaction.transactionInputs = result.newInputs;
    newTransaction.setTransactionId();
    newTransaction.signTransaction(this.wallet.privateKey);
    newTransaction.calculateOutputs(result.coins);

    try {
      this.nodesInfo.forEach(node => {
        axios.put(`${node.url}/transactions/`, {
          transaction: newTransaction,
        });
      })
    } catch (error) {
      console.error(error);
    }
    this.currentBlock.transactions.push(newTransaction);
    if (this.currentBlock.transactions.length >= configuration.blockCapacity) {
      await this.mineAndAddBlock();
    }
  }

  private async mineAndAddBlock() {
    await this.currentBlock.mine();
    if (!(this.currentBlock.validateHash() && this.blockChain[this.blockChain.length - 1].currentHash === this.currentBlock.previousHash)) {
      this.resolveConflict();
    }
    this.blockChain.push(this.currentBlock);
    try {
      this.nodesInfo.forEach(node => {
        axios.post(`${node.url}/block`, {
          block: this.currentBlock,
        });
      })
    } catch (error) {
      console.error(error);
    }
    const newBlock = new Block();
    newBlock.index = this.blockChain[this.blockChain.length - 1].index + 1;
    newBlock.previousHash = this.blockChain[this.blockChain.length - 1].currentHash;
    this.currentBlock = newBlock;
  }

  private resolveConflict() {
    let maxChain = this.blockChain;
    this.nodesInfo.forEach(async node => {
      let response: AxiosResponse<{ chain: NoobCashBlockChain }, any>;
      try {
        response = await axios.get<{ chain: NoobCashBlockChain }>(`${node.url}/chain`);
      } catch (error) {
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
    if (JSON.stringify(chain[0]) !== JSON.stringify(this.blockChain)) return false;
    for (let i = 0; i < chain.length - 1; ++i) {
      const prevBlock = chain[i];
      const nextBlock = chain[i+1];
      if (prevBlock.currentHash !== nextBlock.previousHash) return false;
      if (!nextBlock.validateHash()) return false;
    }
    return true;
  }
}
