import { NoobCashCoins, NoobCashTransaction, NoobCashTransactionInput, NoobCashTransactionOutput } from "./interfaces";
import { hash } from "./utils";

export class Transaction implements NoobCashTransaction {
  public senderAddress!: string;
  public receiverAddress!: string;
  public amount!: NoobCashCoins;
  public transactionId!: string;
  public transactionInputs: NoobCashTransactionInput[] = [];
  public transactionOutputs: NoobCashTransactionOutput[] = [];
  public signature!: string;

  constructor (
    senderAddress: string,
    receiverAddress: string,
    amount: NoobCashCoins,
    transactionInputs?: NoobCashTransactionInput[],
    transactionId?: string,
    transactionOutputs?: NoobCashTransactionOutput[],
    signature?: string,
  ) {
   this.amount = amount;
    this.senderAddress = senderAddress;
    this.receiverAddress = receiverAddress;

    if (transactionId) this.transactionId = transactionId;
    if (transactionOutputs) this.transactionOutputs = transactionOutputs;
    if (transactionInputs) this.transactionInputs = transactionInputs;
    if (signature) this.signature = signature;
  }

  public setTransactionId () {
    this.transactionId = hash({
      senderAddress: this.senderAddress,
      receiverAddress: this.receiverAddress,
      amount: this.amount,
      transactionInputs: this.transactionInputs,
      timestamp: Date.now(),
    });
    return this.transactionId;
  }
  
  public validateTransaction(transaction: NoobCashTransaction): boolean {
    throw new Error("Not implemented");
  };
}
