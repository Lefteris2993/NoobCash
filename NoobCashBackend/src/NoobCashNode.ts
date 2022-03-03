import { Request, Response } from 'express';
import { NodeInfo, NoobCashBlockChain } from "./interfaces";
import { TransactionOutput } from "./transactionOutput";
import { Wallet } from "./wallet";

export abstract class NoobCashNode {
  public wallet!: Wallet;

  protected nodeId!: number;
  protected UTXOs: { owner: string; utxo: TransactionOutput }[] = [];
  protected blockChain: NoobCashBlockChain = [];
  protected nodesInfo: NodeInfo[] = [];

  constructor() {
    this.wallet = new Wallet();
  }

  public abstract ignite (req: Request, res: Response): void;

  public abstract register(req: Request<any, any, NodeInfo>, res: Response): void;
}
