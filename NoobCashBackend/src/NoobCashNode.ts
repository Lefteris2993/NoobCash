import { Request, Response } from 'express';
import { Block } from './block';
import { configuration } from './configuration';
import { NodeInfo, NoobCashBlockChain, PostTransactionDTO, UTXO, ValidateResult } from "./interfaces";
import { Transaction } from './transaction';
import { TransactionInput } from './transactionInput';
import { TransactionOutput } from './transactionOutput';
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

  public postTransaction(req: Request<any, any, PostTransactionDTO>, res: Response): void {
    const receiverAddress = req.body.receiverAddress;
    const amount = req.body.amount;

    const newTransaction = new Transaction(this.wallet.publicKey, receiverAddress, amount);

    if (this.currentBlock.transactions.length >= configuration.blockCapacity) {
      this.currentBlock.mine();
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
    newTransaction.signTransaction();
    newTransaction.calculateOutputs(result.coins);

    // broadCast and more
    
  }
}
