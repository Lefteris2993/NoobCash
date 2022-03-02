import { NoobCashCoins, NoobCashTransactionOutput } from "./interfaces";

export class TransactionOutput implements NoobCashTransactionOutput {
  public outputId!: number;
  public amount!: NoobCashCoins;
  public transactionId!: number;
  public receiverAddress!: string;

  public TransactionOutput() {

  }
}
