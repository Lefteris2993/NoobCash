import { NoobCashCoins, NoobCashTransactionInput } from "./interfaces";

export class TransactionInput implements NoobCashTransactionInput {
  public previousOutputId!: string;
  public amount!: NoobCashCoins;

  constructor(
    previousOutputId: string,
    amount: NoobCashCoins,
  ) {
    this.previousOutputId = previousOutputId;
    this.amount = amount;
  }
}
