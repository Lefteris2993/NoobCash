import { Block } from "./block";
import { Request, Response } from 'express';
import { configuration } from "./configuration";
import { NoobCashNode } from "./NoobCashNode";
import { Transaction } from "./transaction";
import { TransactionOutput } from "./transactionOutput";
import { hash } from "./utils";
import { NodeInfo, PostInfoDTO } from "./interfaces";
import axios, { AxiosResponse } from "axios";

export class BootstrapNode extends NoobCashNode {

  constructor() {
    super();
    this.nodeId = 0;
    this.nodesInfo.push({ 
      url: configuration.url, 
      publicKey: this.wallet.publicKey,
    });
  }

  private async sendNodesInfoToAll() {
    const resultMap = await Promise.all(
      this.nodesInfo.map( x => {
        return axios.post<any, AxiosResponse<any, any>, PostInfoDTO>(
          `${x.url}/info`,
          {
            chain: this.blockChain,
            utxos: this.UTXOs,
            nodesInfo: this.nodesInfo,
          }
        );
      })
    );
    console.log(resultMap);
  }

  private sendInitialCoinsToAllNodes() {
    this.nodesInfo.forEach( x => {
      let transaction = new Transaction(
        this.wallet.publicKey,
        x.publicKey,
        100,
      );
      // More Here
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
    const genesisBlock = new Block();
    genesisBlock.index = 0;
    genesisBlock.transactions = [genesisTransaction];
    genesisBlock.previousHash = '1';
    genesisBlock.nonce = 0;
    genesisBlock.currentHash = hash([genesisTransaction]);
    this.UTXOs.push({
      owner: this.wallet.publicKey,
      utxo: [genesisUTXO],
    });
    this.blockChain.push(genesisBlock);
    res.status(200);
  }

  public async register(req: Request<any, any, NodeInfo>, res: Response<{ nodeId: number }>): Promise<void> {
    const newNodeId = this.nodesInfo.length;
    this.nodesInfo.push({
      url: req.body.url,
      publicKey: req.body.publicKey,
    });

    this.UTXOs.push({ owner: req.body.publicKey, utxo: [] });
    res.status(200).json({ nodeId: newNodeId });
    
    if (newNodeId === configuration.totalNodes) {
      await this.sendNodesInfoToAll();
      this.sendInitialCoinsToAllNodes();
    }
  }

  public info(req: Request<any, any, NodeInfo[]>, res: Response) {
    res.status(418).send('I am a teapot');
  }
}
