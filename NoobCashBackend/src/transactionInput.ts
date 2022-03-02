import { NoobCashCoins, NoobCashTransactionInput } from "./interfaces";

export class TransactionInput implements NoobCashTransactionInput {
  public previousOutputId!: number;
  public amount!: NoobCashCoins;

  public TransactionInput() {

  }
}
