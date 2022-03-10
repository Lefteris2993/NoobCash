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
    if (!configuration.production) {
      this.wallet.publicKey = `-----BEGIN RSA PUBLIC KEY-----
MEoCQwMAbu2vqE7dAgSUScs5B1Kj1nYOKt33NuxP4ieQrvOtyhPIwS+t4vtT9oyh
Xiw5qwgFMM4RAV2hj0R7o7vUGzE/jT0CAwEBAQ==
-----END RSA PUBLIC KEY-----`
      this.wallet.privateKey = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIBzTBXBgkqhkiG9w0BBQ0wSjApBgkqhkiG9w0BBQwwHAQIGEKSgAFBAJ8CAggA
MAwGCCqGSIb3DQIJBQAwHQYJYIZIAWUDBAEqBBDp3Ohm5BOvNIM/DUBzuxmiBIIB
cCifUE02V1IFufDOHyHPZTD4riqL79/fxOqTc2ddpr7Wx2GPNGC7AlNgc7HUeod5
iJl4giQD5i/NUTtmPpZNI/2YLZ2pX9FlXH+ng5aLnrqKPVYde0cAAg6croc5H0qr
WIyQR0vfDR5hhgqTRvE27UetNVGkLW4HLrv9oTbXjtPZTtu5yegBkxXQCt3akmpj
GmrNFS/m8EkRoWENGAieb1pRSgm5ghqZ5IpIEDGyYP7qand0kvdW+7mhrbfAJKte
rmwycaz0e1tomzww5PicWhdX3TrbqgE6qF6k1qH+y29sNhFORykF6pqYrt3oYKdE
BHTyrpSAjfYfHGCNpCp5Jx8i0XqKr8FprBChXZ63njfnbErshh93iKWlvcvGxqop
HJ4miUvdZU7CQDbi4QReuuA3hv6OL09QJ2uyZcCyEuEwZyElsfLI9fgzmIyod2KG
R2Td82MEcVM18a//+/l87rEG8BczWHPpJ/JbLEIfiWFf
-----END ENCRYPTED PRIVATE KEY-----`
    }
  }

  private async sendNodesInfoToAll() {
    const resultMap = await Promise.all(
      this.nodesInfo.map( node => {
        if (node.publicKey === this.wallet.publicKey) return;
        return axios.post<any, AxiosResponse<any, any>, PostInfoDTO>(
          `${node.url}/info/`,
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
      setImmediate(() => this.syncNodes());
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
