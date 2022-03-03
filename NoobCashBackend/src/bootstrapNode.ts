import { Block } from "./block";
import { Request, Response } from 'express';
import { configuration } from "./configuration";
import { NoobCashNode } from "./NoobCashNode";
import { Transaction } from "./transaction";
import { TransactionOutput } from "./transactionOutput";
import { hash } from "./utils";
import { NodeInfo } from "./interfaces";

export class BootstrapNode extends NoobCashNode {

  constructor() {
    super();
    this.nodeId = 0;
    this.nodesInfo.push({ 
      url: configuration.url, 
      publicKey: this.wallet.publicKey,
    });
  }
  
  
  public ignite (_: Request, res: Response) {
    const genesisTransaction = new Transaction(
      'God',
      this.wallet.publicKey,
      configuration.totalNodes * 100,

    );
    genesisTransaction.setTransactionId();
    const genesisUTXO = new TransactionOutput(
      genesisTransaction.transactionId,
      genesisTransaction.receiverAddress,
      genesisTransaction.amount
    );
    genesisTransaction.transactionOutputs.push(genesisUTXO);
    const genesisBlock = new Block(0, [genesisTransaction], '1', 0, hash([genesisTransaction]))
    this.UTXOs.push({
      owner: this.wallet.publicKey,
      utxo: genesisUTXO,
    });
    this.blockChain.push(genesisBlock);
    res.status(200);
  }

  public register(req: Request<any, any, NodeInfo>, res: Response): void {
    const newNodeId = this.nodesInfo.length;
    this.nodesInfo.push({
      url: req.body.url,
      publicKey: req.body.publicKey,
    });

    // Needs implementation;
    

    if (newNodeId === configuration.totalNodes) {
      // do something
    }
  }
}
