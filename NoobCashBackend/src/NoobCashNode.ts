import axios, { AxiosResponse } from 'axios';
import { Request, Response } from 'express';
import { Block } from './block';
import { configuration } from './configuration';
import { NodeInfo, NoobCashBlockChain, PostTransactionDTO, UTXO, ValidateResult } from "./interfaces";
import { Transaction } from './transaction';
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

  public abstract ignite (req: Request, res: Response): void;
  public abstract register(req: Request<any, any, NodeInfo>, res: Response): void;
  public abstract info(req: Request<any, any, NodeInfo[]>, res: Response): void;

  public async postTransaction(req: Request<any, any, PostTransactionDTO>, res: Response): Promise<void> {
    const receiverAddress = req.body.receiverAddress;
    const amount = req.body.amount;

    const newTransaction = new Transaction(this.wallet.publicKey, receiverAddress, amount);

    if (this.currentBlock.transactions.length >= configuration.blockCapacity) {
      await this.mineAndAddBlock();
    }

    const senderUtxos = this.UTXOs.find(x => x.owner === this.wallet.publicKey);
    if (!senderUtxos) {
      res.status(400).send('Bad request');
      return;
    }

    let result: ValidateResult;
    try {
      result = newTransaction.validate(senderUtxos);
    } catch (error) {
      console.error(error);
      res.status(400);
      return;
    }
    
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
      // maybe validate Transaction also...
    }

    return true;
  }
}
