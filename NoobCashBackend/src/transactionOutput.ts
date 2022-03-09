import { NoobCashCoins, NoobCashTransactionOutput } from "./interfaces";
import { hash } from "./utils";

export class TransactionOutput implements NoobCashTransactionOutput {
  public outputId!: string;
  public amount!: NoobCashCoins;
  public transactionId!: string;
  public receiverAddress!: string;

  constructor(
    transactionId: string,
    receiverAddress: string,
    amount: NoobCashCoins,
    outputId?: string,
  ) {
    this.transactionId = transactionId;
    this.receiverAddress = receiverAddress;
    this.amount = amount;
    if (outputId) this.outputId = outputId;
    else this.outputId = hash({
      transactionId: this.transactionId,
      receiverAddress: this.receiverAddress,
      amount: this.amount,
    });
  }
}
