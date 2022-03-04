import { NoobCashCoins, NoobCashTransaction, NoobCashTransactionInput, NoobCashTransactionOutput, UTXO, ValidateResult } from "./interfaces";
import { TransactionInput } from "./transactionInput";
import { TransactionOutput } from "./transactionOutput";
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

  public setTransactionId(): string {
    this.transactionId = hash({
      senderAddress: this.senderAddress,
      receiverAddress: this.receiverAddress,
      amount: this.amount,
      transactionInputs: this.transactionInputs,
      timestamp: Date.now(),
    });
    return this.transactionId;
  }

  public signTransaction(): void {

  }
  
  public validate(senderUtxos: UTXO): ValidateResult {
    let coins = 0;
    const spentOutputs: TransactionOutput[] = [];
    senderUtxos.utxo.forEach(utxo => {
      if (coins >= this.amount) return;
      coins += utxo.amount;
      spentOutputs.push(utxo);
    })
    if (coins < this.amount)
      throw new Error("Not enough NoobCash Coins");

    const newInputs = spentOutputs.map( output => {
      return new TransactionInput(output.outputId, output.amount);
    });

    return { newInputs: newInputs, usedOutputs: spentOutputs, coins: coins };
  };

  public calculateOutputs(coins: NoobCashCoins): TransactionOutput[] {
    const newOutputs: TransactionOutput[] = [];
    if (coins > this.amount) {
      newOutputs.push(new TransactionOutput(
        this.transactionId,
        this.receiverAddress,
        this.amount,
        0,
      ));
      newOutputs.push(new TransactionOutput(
        this.transactionId,
        this.senderAddress,
        coins- this.amount,
        1,
      ));
    } else {
      newOutputs.push(new TransactionOutput(
        this.transactionId,
        this.receiverAddress,
        this.amount,
        0,
      ))
    }
    this.transactionOutputs = newOutputs;
    return newOutputs;
  }
}
