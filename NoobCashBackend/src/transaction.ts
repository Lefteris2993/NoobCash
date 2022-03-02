import { NoobCashCoins, NoobCashTransaction, NoobCashTransactionInput, NoobCashTransactionOutput } from "./interfaces";

export class Transaction implements NoobCashTransaction {
  public senderAddress!: string;
  public receiverAddress!: string;
  public amount!: NoobCashCoins;
  public transactionId!: number;
  public transactionInputs: NoobCashTransactionInput[] = [];
  public transactionOutputs: NoobCashTransactionOutput[] = [];
  public signature!: string;

  public Transaction() {

  }
  
  public validateTransaction(transaction: NoobCashTransaction): boolean {
    throw new Error("Not implemented");
  };
}
