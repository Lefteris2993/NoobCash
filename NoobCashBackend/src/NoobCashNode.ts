import { Request, Response } from 'express';
import { NodeInfo, NoobCashBlockChain, UTXO } from "./interfaces";
import { TransactionOutput } from "./transactionOutput";
import { Wallet } from "./wallet";

export abstract class NoobCashNode {
  protected wallet!: Wallet;
  protected nodeId!: number;
  protected UTXOs: UTXO[] = [];
  protected blockChain: NoobCashBlockChain = [];
  protected nodesInfo: NodeInfo[] = [];

  constructor() {
    this.wallet = new Wallet();
  }

  public abstract ignite (req: Request, res: Response): void;
  public abstract register(req: Request<any, any, NodeInfo>, res: Response): void;
  public abstract info(req: Request<any, any, NodeInfo[]>, res: Response): void;
}
