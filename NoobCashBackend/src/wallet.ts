import { NoobCashTransaction, NoobCashWallet } from "./interfaces";

export class Wallet implements NoobCashWallet {
  public publicKey!: string;
  public privateKey!: string;

  public Wallet() {

  }
  
  public signTransaction(transaction: NoobCashTransaction): void {
    
  };
  
  public verifyTransaction(transaction: NoobCashTransaction): boolean {
    throw new Error("Not implemented");
  };
}
