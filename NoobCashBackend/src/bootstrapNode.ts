import { Block } from "./block";
import { configuration } from "./configuration";
import { NoobCashNode } from "./NoobCashNode";
import { Transaction } from "./transaction";
import { TransactionOutput } from "./transactionOutput";
import { hash, NoobCashError } from "./utils";
import { NodeInfo, NoobCashBlockChain, PostInfoDTO, PostRegisterResponseDTO, UTXO } from "./interfaces";
import axios, { AxiosResponse } from "axios";

export class BootstrapNode extends NoobCashNode {

  constructor() {
    super();
    this.nodeId = 0;
  }

  private async sendNodesInfoToAll() {
    const resultMap = await Promise.all(
      this.nodesInfo.map( x => {
        if (x.publicKey === this.wallet.publicKey) return;
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
  }

  private async sendInitialCoinsToAllNodes() {
    const resultMap = await Promise.all(
      this.nodesInfo.map( node => {
        if (node.publicKey === this.wallet.publicKey) return;
        return this.postTransaction(100, node.publicKey);
      })
    );
  }

  private async syncNodes() {
    await this.sendNodesInfoToAll();
    await this.sendInitialCoinsToAllNodes();
  }
  
  public async ignite (): Promise<void>  {
    this.nodesInfo.push({ 
      url: configuration.url, 
      publicKey: this.wallet.publicKey,
    });
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
  }

  public register(nodeInfo: NodeInfo): PostRegisterResponseDTO {
    const newNodeId = this.nodesInfo.length;
    if (newNodeId === configuration.totalNodes - 1) {
      this.syncNodes();
    }
    this.nodesInfo.push({
      url: nodeInfo.url,
      publicKey: nodeInfo.publicKey,
    });
    this.UTXOs.push({ owner: nodeInfo.publicKey, utxo: [] });
    return { nodeId: newNodeId };
  }

  public info(_info: NodeInfo[], _utxos: UTXO[], _chain: NoobCashBlockChain) {
    throw new NoobCashError('I am a teapot', 418);
  }
}
