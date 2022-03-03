import { NoobCashCoins, NoobCashTransactionOutput } from "./interfaces";

export class TransactionOutput implements NoobCashTransactionOutput {
  public outputId!: number;
  public amount!: NoobCashCoins;
  public transactionId!: string;
  public receiverAddress!: string;

  constructor(
    transactionId: string,
    receiverAddress: string,
    amount: NoobCashCoins,
    outputId: number = 0,
  ) {
    this.transactionId = transactionId;
    this.receiverAddress = receiverAddress;
    this.amount = amount;
    this.outputId = outputId;
  }
}
