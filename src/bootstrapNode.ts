import { NoobCashNode } from "./NoobCashNode";
import { TransactionOutput } from "./transactionOutput";
import { hash, NoobCashError } from "./utils";
import { 
  NodeInfo, 
  NoobCashBlock, 
  NooBCashConfiguration, 
  NoobCashTransaction, 
  PostInfoDTO, 
  PostRegisterResponseDTO, 
} from "./interfaces";

export class BootstrapNode extends NoobCashNode {
  private ready = false;
  private genesisBlock!: NoobCashBlock;

  constructor(configuration: NooBCashConfiguration) {
    super(configuration);
    this.nodeId = 0;
    if (!this.configuration.production) {
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

  private async sendInitialCoinsToAllNodes() {
    const resultMap = await Promise.all(
      this.nodesInfo.map( node => {
        if (node.publicKey === this.wallet.publicKey) return;
        return this.postTransaction(100, node.publicKey);
      })
    );
  }

  private async syncNodes() {
    const data: PostInfoDTO = {
      genesisBlock: this.genesisBlock,
      nodesInfo: this.nodesInfo,
    }
    await this.broadcast('post', 'info', data);
    await this.sendInitialCoinsToAllNodes();
  }
  
  public async ignite (): Promise<void>  {
    if (this.ignited) throw new NoobCashError('Already ignited', 400);
    await this.wallet.generateKeyPair();
    this.nodesInfo.push({ 
      url: this.configuration.url, 
      publicKey: this.wallet.publicKey,
    });
    const genesisTransaction: NoobCashTransaction = {
      senderAddress: 'God',
      receiverAddress: this.wallet.publicKey,
      amount: this.configuration.totalNodes * 100,
      timestamp: Date.now(),
    }
    const genId = this.transactionService.setTransactionId(genesisTransaction);
    this.transactionService.signTransaction(genesisTransaction, this.wallet.privateKey);

    const genesisUTXO = new TransactionOutput(
      genId,
      genesisTransaction.receiverAddress,
      genesisTransaction.amount
    );
    genesisTransaction.transactionOutputs = [];
    genesisTransaction.transactionOutputs.push(genesisUTXO);
    const genesisBlock: NoobCashBlock = {
      index: 0,
      transactions: [genesisTransaction],
      previousHash: '1',
      nonce: 0,
      currentHash: hash({
        index: 0,
        timestamp: Date.now(),
        transactions: [genesisTransaction],
        nonce: 0,
        previousHash: '1',
      }),
      timestamp: Date.now(),
      utxos: [{
        owner: this.wallet.publicKey,
        utxos: [genesisUTXO],
      }],
    }
    this.chainService.addGenesis(genesisBlock);
    this.genesisBlock = genesisBlock;
    this.ready = true;
    this.ignited = true;
  }

  public register(nodeInfo: NodeInfo): PostRegisterResponseDTO {
    if (!this.ready) throw new NoobCashError('Not ready. Try again', 503);
    const newNodeId = this.nodesInfo.length;
    if (newNodeId === this.configuration.totalNodes - 1) {
      setTimeout(() => this.syncNodes());
    }
    this.nodesInfo.push({
      url: nodeInfo.url,
      publicKey: nodeInfo.publicKey,
    });
    this.genesisBlock?.utxos.push({ owner: nodeInfo.publicKey, utxos: [] });
    return { nodeId: newNodeId };
  }

  public info(_info: NodeInfo[], _block: NoobCashBlock) {
    throw new NoobCashError('I am a teapot', 418);
  }
}
