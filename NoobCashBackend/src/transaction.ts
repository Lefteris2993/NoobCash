import { RSA_PKCS1_PSS_PADDING } from "constants";
import { sign, verify } from "crypto";
import { configuration } from "./configuration";
import { NoobCashCoins, NoobCashTransaction, NoobCashTransactionInput, NoobCashTransactionOutput, UTXO, ValidateResult } from "./interfaces";
import { TransactionInput } from "./transactionInput";
import { TransactionOutput } from "./transactionOutput";
import { hash, NoobCashError } from "./utils";

export class Transaction implements NoobCashTransaction {
  public senderAddress!: string;
  public receiverAddress!: string;
  public amount!: NoobCashCoins;
  public transactionId!: string;
  public transactionInputs: NoobCashTransactionInput[] = [];
  public transactionOutputs: NoobCashTransactionOutput[] = [];
  public signature!: string;
  public timestamp!: number;

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
    this.timestamp = Date.now();

    if (transactionId) this.transactionId = transactionId;
    if (transactionOutputs) this.transactionOutputs = transactionOutputs;
    if (transactionInputs) this.transactionInputs = transactionInputs;
    if (signature) this.signature = signature;
  }

  public static toTransaction(transaction: NoobCashTransaction): Transaction {
    const newTransaction = new Transaction(
      transaction.senderAddress,
      transaction.receiverAddress,
      transaction.amount,
      transaction.transactionInputs,
      transaction.transactionId,
      transaction.transactionOutputs,
      transaction.signature,
    );
    newTransaction.timestamp = transaction.timestamp;
    return newTransaction;
  }

  public setTransactionId(): string {
    this.transactionId = hash({
      senderAddress: this.senderAddress,
      receiverAddress: this.receiverAddress,
      amount: this.amount,
      transactionInputs: this.transactionInputs,
      timestamp: this.timestamp,
    });
    return this.transactionId;
  }

  private getVerifiableData(): string {
    return JSON.stringify({
      transactionId: this.transactionId,
      senderAddress: this.senderAddress,
      receiverAddress: this.receiverAddress,
      amount: this.amount,
      transactionInputs: this.transactionInputs,
      transactionOutputs: this.transactionOutputs,
    });
  }

  public signTransaction(privateKey: string): void {
    const verifiableData = this.getVerifiableData();
    const signature = sign('sha256', Buffer.from(verifiableData), {
      key: privateKey,
      passphrase: configuration.secret,
      padding: RSA_PKCS1_PSS_PADDING,
    }).toString();
    this.signature = signature;
  }

  public verifySignature(): boolean {
    const verifiableData = this.getVerifiableData();
    return verify(
      'sha256',
      Buffer.from(verifiableData),
      {
        key: this.senderAddress,
        padding: RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(this.signature)
    )
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
      throw new NoobCashError('Not enough NoobCash Coins', 400);

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
      ));
      newOutputs.push(new TransactionOutput(
        this.transactionId,
        this.senderAddress,
        coins- this.amount,
      ));
    } else {
      newOutputs.push(new TransactionOutput(
        this.transactionId,
        this.receiverAddress,
        this.amount,
      ))
    }
    this.transactionOutputs = newOutputs;
    return newOutputs;
  }
}
