import axios from "axios";
import { Block } from "./block";
import { configuration } from "./configuration";
import { NoobCashBlockChain } from "./interfaces";
import { Transaction } from "./transaction";
import { TransactionOutput } from "./transactionOutput";
import { Wallet } from "./wallet";

export class NoobCashNode {
  public wallet!: Wallet;

  private UTXOs: { owner: string; utxo: TransactionOutput }[] = [];
  private blockChain: NoobCashBlockChain = [];

  public NoobCashNode() {
    this.wallet = new Wallet();
  }

  public ignite = () => {
    if (configuration.isBootstrap) {
      const genesisTransaction = new Transaction();
      const genesisUTXO = new TransactionOutput();
      genesisTransaction.transactionOutputs.push(genesisUTXO);
      const genesisBlock = new Block();
      this.UTXOs.push({
        owner: this.wallet.publicKey,
        utxo: genesisUTXO,
      });
      this.blockChain.push(genesisBlock);
    } else {
      // Implement a while true here!
      axios.post(`${configuration.bootstrapNodeUrl}/register`, {
        publicKey: this.wallet.publicKey,
      })
    }
  }
}
