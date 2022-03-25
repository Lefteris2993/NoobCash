import { NoobCashWallet } from "./interfaces";
import { generateKeyPair } from "crypto";
import { Logger } from "./utils";

export class Wallet implements NoobCashWallet {
  public publicKey!: string;
  public privateKey!: string;

  constructor(
    production: boolean,
    secret: string,
  ) {
    if (!production) return;
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
          passphrase: secret,
        }
      },
      (_, publicKey, privateKey) => {
        Logger.warn('Wallet rsa key pair created');
        this.publicKey = publicKey;
        this.privateKey = privateKey;
      }
    );
  }
}
