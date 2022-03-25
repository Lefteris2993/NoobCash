import axios from 'axios';
import { ChainService } from './chainService';
import { 
  GetBalanceResponseDTO, 
  GetChainResponseDTO, 
  GetTransactionsResponseDTO, 
  NodeInfo, 
  NoobCashBlock, 
  NoobCashCoins, 
  NooBCashConfiguration, 
  NoobCashTransaction, 
  PostBlockDTO, 
  PostRegisterResponseDTO, 
  PutTransactionDTO, 
  UTXO 
} from "./interfaces";
import { MinerService } from './minerService';
import { TransactionService } from './transactionService';
import { Logger, NoobCashError } from './utils';
import { Wallet } from "./wallet";

export abstract class NoobCashNode {
  protected ignited = false;
  protected wallet!: Wallet;
  protected nodeId!: number;
  protected nodesInfo: NodeInfo[] = [];
  protected configuration!: NooBCashConfiguration;

  protected transactionService!: TransactionService;
  protected minerService!: MinerService;
  protected chainService!: ChainService;

  constructor(configuration: NooBCashConfiguration) {
    this.configuration = configuration;
    this.wallet = new Wallet(
      configuration.production, 
      configuration.secret
    );
    this.transactionService = new TransactionService(
      configuration.secret
    );
    this.minerService = new MinerService(
      configuration.difficulty,
      configuration.miningInterval,
    );
    this.chainService = new ChainService(
      this.transactionService,
      this.minerService,
      configuration.difficulty,
    );  
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

    while(transactions.length !== this.configuration.blockCapacity) {
      if (this.transactionService.transactionQueue.length < 1) {
        transactions.forEach(x => this.transactionService.transactionQueue.queue(x));
        return;
      }
      const t = this.transactionService.transactionQueue.dequeue();
      if (!t.transactionId) continue;
      if ((this.transactionService.minedTransactions.get(t.transactionId) || 0) > 0) continue;
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
    if (minedBlock) {
      minedBlock.transactions.forEach(x => {
        if (!x.transactionId) return;
        // TODO: Not use if all of this are needed maybe test how the module works
        if (this.transactionService.minedTransactions.contains(x.transactionId)) {
          const prevValue = this.transactionService.minedTransactions.get(x.transactionId);
          if (!prevValue) return;
          this.transactionService.minedTransactions.delete(x.transactionId);
          this.transactionService.minedTransactions.insert(x.transactionId, prevValue + 1);
        } else {
          this.transactionService.minedTransactions.insert(x.transactionId, 1);
        }
      });
      const data: PostBlockDTO = {
        block: minedBlock,
      }
      this.broadcast('post', 'block', data);
      this.chainService.addBlock(minedBlock);
    }

    if (this.transactionService.transactionQueue.length >= this.configuration.blockCapacity) {
      setTimeout(() => this.mineAndBroadcastBlock());
    }
  }

  public abstract ignite (): Promise<void>;
  public abstract register(nodeInfo: NodeInfo): PostRegisterResponseDTO;
  public abstract info(nodeInfo: NodeInfo[], genesisBlock: NoobCashBlock): void;

  public getBalance(): GetBalanceResponseDTO {
    const b = this.chainService.getLatestBlock();
    const utxos = b.utxos.find(x => x.owner === this.wallet.publicKey);
    if (!utxos) throw new NoobCashError('Internal server error', 500);
    const amount = utxos.utxos.reduce((x, y) => x + y.amount , 0);
    return { amount: amount };
  }

  public getTransactions(): GetTransactionsResponseDTO {
    throw new NoobCashError('Not implemented', 501);
  }

  public getChain(): GetChainResponseDTO {
    const chain = this.chainService.getBlockchain();
    return { chain: chain };
  }

  public putTransaction(t: NoobCashTransaction) {
    if(!this.transactionService.verifySignature(t)) {
      throw new NoobCashError('Invalid transaction', 400);
    }
    
    this.transactionService.transactionQueue.queue(t);
    if (this.transactionService.transactionQueue.length >= this.configuration.blockCapacity) {
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

    this.transactionService.transactionQueue.queue(newTransaction);
    
    const data: PutTransactionDTO = {
      transaction: newTransaction,
    } 
    this.broadcast('put', 'transactions', data);

    if (this.transactionService.transactionQueue.length >= this.configuration.blockCapacity) {
      setTimeout(() => this.mineAndBroadcastBlock());
    }
  }
}
