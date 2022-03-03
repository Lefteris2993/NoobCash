import axios from "axios";
import { Request, Response } from 'express';
import { Block } from "./block";
import { configuration } from "./configuration";
import { NoobCashBlockChain } from "./interfaces";
import { Transaction } from "./transaction";
import { TransactionOutput } from "./transactionOutput";
import { hash } from "./utils";
import { Wallet } from "./wallet";

export class NoobCashNode {
  public wallet!: Wallet;

  private UTXOs: { owner: string; utxo: TransactionOutput }[] = [];
  private blockChain: NoobCashBlockChain = [];

  constructor() {
    this.wallet = new Wallet();
  }

  public ignite (_: Request, res: Response) {
    if (configuration.isBootstrap) {
      const genesisTransaction = new Transaction(
        'God',
        this.wallet.publicKey,
        configuration.capacity * 100,

      );
      genesisTransaction.setTransactionId();
      const genesisUTXO = new TransactionOutput(
        genesisTransaction.transactionId,
        genesisTransaction.receiverAddress,
        genesisTransaction.amount
      );
      genesisTransaction.transactionOutputs.push(genesisUTXO);
      const genesisBlock = new Block(
        0,
        [genesisTransaction],
        hash(this.blockChain),
        0,
        hash([genesisTransaction]),
      )
      this.UTXOs.push({
        owner: this.wallet.publicKey,
        utxo: genesisUTXO,
      });
      this.blockChain.push(genesisBlock);
      res.status(200);
    } else {
      while (true) {
        try {
          let response = axios.post(`${configuration.bootstrapNodeUrl}/register`, {
            publicKey: this.wallet.publicKey,
          })

          console.log(response);
          break;
        } catch (error) {
          // Do nothing
        }
      }
      res.status(200);
    }
  }
}
