import { AvlTree } from "@tyriar/avl-tree";
import { RSA_PKCS1_PSS_PADDING } from "constants";
import { sign, verify } from "crypto";
import PriorityQueue from "ts-priority-queue";
import { NoobCashCoins, NoobCashTransaction, UTXO, ValidateResult } from "./interfaces";
import { TransactionInput } from "./transactionInput";
import { TransactionOutput } from "./transactionOutput";
import { hash, Logger, NoobCashError } from "./utils";

export class TransactionService {
  private secret!: string;

  public minedTransactions = new AvlTree<string, number>();
  public transactionQueue = new PriorityQueue<NoobCashTransaction>({ 
    comparator: (a: NoobCashTransaction, b: NoobCashTransaction) => {
      return a.timestamp - b.timestamp;
  }});

  constructor(secret: string) {
    this.secret = secret;
  }

  private getVerifiableData(t: NoobCashTransaction): string {
    return JSON.stringify({
      transactionId: t.transactionId,
      senderAddress: t.senderAddress,
      receiverAddress: t.receiverAddress,
      amount: t.amount,
    });
  }

  public setTransactionId(t: NoobCashTransaction): string {
    const transactionId = hash({
      senderAddress: t.senderAddress,
      receiverAddress: t.receiverAddress,
      amount: t.amount,
      timestamp: t.timestamp,
    });
    t.transactionId = transactionId
    return transactionId;
  }

  public signTransaction(t: NoobCashTransaction, privateKey: string): Buffer {
    const verifiableData = this.getVerifiableData(t);
    const signature = sign('sha256', Buffer.from(verifiableData), {
      key: privateKey,
      passphrase: this.secret,
      padding: RSA_PKCS1_PSS_PADDING,
    });
    t.signature = signature;
    return signature;
  }

  public verifySignature(t: NoobCashTransaction): boolean {
    if (!t.signature) return false;
    const verifiableData = this.getVerifiableData(t);
    return verify(
      'sha256',
      Buffer.from(verifiableData),
      {
        key: t.senderAddress,
        padding: RSA_PKCS1_PSS_PADDING,
      },
      Buffer.from(t.signature),
    );
  }

  public calculateInputs(t: NoobCashTransaction, senderUtxos: UTXO): ValidateResult | undefined {
    let coins = 0;
    const spentOutputs: TransactionOutput[] = [];
    senderUtxos.utxos.forEach(utxo => {
      if (coins >= t.amount) return;
      coins += utxo.amount;
      spentOutputs.push(utxo);
    })
    if (coins < t.amount) {
      Logger.error(`Transaction: ${t.transactionId} Not enough coins`);
      return undefined;
    } 

    const newInputs = spentOutputs.map( output => {
      return new TransactionInput(output.outputId, output.amount);
    });

    return { newInputs: newInputs, usedOutputs: spentOutputs, coins: coins };
  };

  public calculateOutputs(t: NoobCashTransaction, coins: NoobCashCoins): TransactionOutput[] {
    if (!t.transactionId) throw new NoobCashError('Invalid transaction', 400);
    const newOutputs: TransactionOutput[] = [];
    if (coins > t.amount) {
      newOutputs.push(new TransactionOutput(
        t.transactionId,
        t.receiverAddress,
        t.amount,
      ));
      newOutputs.push(new TransactionOutput(
        t.transactionId,
        t.senderAddress,
        coins - t.amount,
      ));
    } else {
      newOutputs.push(new TransactionOutput(
        t.transactionId,
        t.receiverAddress,
        t.amount,
      ))
    }
    return newOutputs;
  }
}
