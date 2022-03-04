import { NoobCashCoins, NoobCashTransactionInput } from "./interfaces";

export class TransactionInput implements NoobCashTransactionInput {
  public previousOutputId!: number;
  public amount!: NoobCashCoins;

  constructor(
    previousOutputId: number,
    amount: NoobCashCoins,
  ) {
    this.previousOutputId = previousOutputId;
    this.amount = amount;
  }
}
