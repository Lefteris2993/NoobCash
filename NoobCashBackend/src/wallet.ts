import { NoobCashTransaction, NoobCashWallet } from "./interfaces";
import { generateKeyPair } from "crypto";
import { configuration } from "./configuration";
import { NoobCashError } from "./utils";

export class Wallet implements NoobCashWallet {
  public publicKey!: string;
  public privateKey!: string;

  constructor() {
    generateKeyPair(
      'rsa',
      {
        modulusLength: 530,
        publicExponent: 0x10101,
        publicKeyEncoding: {
          type: 'pkcs1',
          format: 'pem'
        },
        privateKeyEncoding: {
          type: 'pkcs8',
          format: 'pem',
          cipher: 'aes-256-cbc',
          passphrase: configuration.secret,
        }
      },
      (_, publicKey, privateKey) => {
        this.publicKey = publicKey;
        this.privateKey = privateKey;                
      }
    );
  }
}
