import axios, { AxiosResponse } from 'axios';
import { Block } from './block';
import { ChainService } from './chainService';
import { configuration } from './configuration';
import { 
  GetBalanceResponseDTO, 
  GetChainResponseDTO, 
  GetTransactionsResponseDTO, 
  NodeInfo, 
  NoobCashBlock, 
  NoobCashBlockChain, 
  NoobCashCoins, 
  NoobCashTransaction, 
  PostRegisterResponseDTO, 
  UTXO 
} from "./interfaces";
import { MinerService } from './minerService';
import { Transaction } from './transaction';
import { TransactionService } from './transactionService';
import { Logger, NoobCashError } from './utils';
import { Wallet } from "./wallet";

export abstract class NoobCashNode {
  protected ignited = false;
  protected wallet!: Wallet;
  protected nodeId!: number;
  protected nodesInfo: NodeInfo[] = [];

  protected chainService = new ChainService();
  protected minerService = new MinerService();
  protected transactionService = new TransactionService();

  constructor() {
    this.wallet = new Wallet();
  }

  protected async broadcast(method: 'post' | 'get' | 'put', endpoint: string, data: any) {
    Logger.warn(`[Broadcast]: ${method} /${endpoint}`);
    try {
      await Promise.all(
        this.nodesInfo.map( node => {
          if (node.publicKey === this.wallet.publicKey) return;
          return axios(
            {
              method: method,
              url: `${node.url}/${endpoint}/`,
              data: data,
            }
          );
        })
      )
    } catch (_error) {
      // Do nothing
    }
  }

  private async mineAndBroadcastBlock(): Promise<void> {
    if (this.minerService.isMining()) return;
    const previousBlock = this.chainService.getLatestBlock();
    const index = previousBlock.index + 1;
    const timestamp = Date.now();
    const previousHash = previousBlock.currentHash;
    const transactions: NoobCashTransaction[] = []
    const newUtxos = JSON.parse(JSON.stringify(previousBlock.utxos)) as UTXO[];

    while(transactions.length !== configuration.blockCapacity) {
      const t = this.transactionService.transactionQueue.deQueue();
      if (!t) {
        transactions.forEach(x => this.transactionService.transactionQueue.enQueue(x));
        return;
      }
      const senderUtxos = newUtxos.find(x => x.owner === t.senderAddress);
      if (!senderUtxos) continue;
      const res = this.transactionService.calculateInputs(t, senderUtxos);
      if (!res) continue;
      senderUtxos.utxos = senderUtxos.utxos.filter(x =>
        res.usedOutputs.find(y => y.outputId === x.outputId) === undefined 
      );
      t.transactionInputs = res.newInputs;
      t.transactionOutputs = this.transactionService.calculateOutputs(t, res.coins);
      t.transactionOutputs.forEach(output => {
        const receiver = newUtxos.find(x => x.owner === output.receiverAddress);
        if (!receiver) return;
        receiver.utxos.push(output);
      });
      transactions.push(t);
    }

    const newBlock: NoobCashBlock = {
      index: index,
      timestamp: timestamp,
      previousHash: previousHash,
      transactions: transactions,
      utxos: newUtxos,
      nonce: 0,
      currentHash: '0',
    }

    const minedBlock = await this.minerService.mineBlock(newBlock);
    if (minedBlock) this.broadcast('post', 'block', { block: minedBlock });

    if (this.transactionService.transactionQueue.size() > configuration.blockCapacity) {
      setTimeout(() => this.mineAndBroadcastBlock());
    }
  }

  public abstract ignite (): Promise<void>;
  public abstract register(nodeInfo: NodeInfo): PostRegisterResponseDTO;
  public abstract info(nodeInfo: NodeInfo[], genesisBlock: NoobCashBlock): void;

  public getBalance(): GetBalanceResponseDTO {
    throw new NoobCashError('Not implemented', 501);
  }

  public getTransactions(): GetTransactionsResponseDTO {
    throw new NoobCashError('Not implemented', 501);
  }

  public getChain(): GetChainResponseDTO {
    throw new NoobCashError('Not implemented', 501);
  }

  public putTransaction(t: NoobCashTransaction) {
    if(!this.transactionService.verifySignature(t)) {
      throw new NoobCashError('Invalid transaction', 400);
    }
    
    this.transactionService.transactionQueue.enQueue(t);
    if (this.transactionService.transactionQueue.size() > configuration.blockCapacity) {
      setTimeout(() => this.mineAndBroadcastBlock());
    }
  }
  
  public postBlock(b: NoobCashBlock) {
    this.chainService.addBlock(b);
  }

  public postTransaction(amount: NoobCashCoins, receiverAddress?: string, receiverId?: number): void {
    let receiver: NodeInfo | undefined = undefined;
    if (receiverAddress) receiver = this.nodesInfo.find( node => node.publicKey === receiverAddress);
    else if (receiverId !== undefined) receiver = this.nodesInfo[receiverId];
    if (receiver === undefined) throw new NoobCashError('User not found', 400);

    const newTransaction: NoobCashTransaction = {
      senderAddress: this.wallet.publicKey,
      receiverAddress: receiver.publicKey,
      amount: amount,
      timestamp: Date.now(),
    }

    this.transactionService.setTransactionId(newTransaction);
    this.transactionService.signTransaction(newTransaction, this.wallet.privateKey);

    this.transactionService.transactionQueue.enQueue(newTransaction);
    this.broadcast('put', 'transactions', { transaction: newTransaction });

    if (this.transactionService.transactionQueue.size() > configuration.blockCapacity) {
      setTimeout(() => this.mineAndBroadcastBlock());
    }
  }
}
