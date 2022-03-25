import { NoobCashWallet } from "./interfaces";
import { generateKeyPair } from "crypto";
import { Logger } from "./utils";

export class Wallet implements NoobCashWallet {
  private production!: boolean;
  private secret!: string;

  public publicKey!: string;
  public privateKey!: string;

  constructor(
    production: boolean,
    secret: string,
  ) {
    this.production = production;
    this.secret = secret;
  }

  public async generateKeyPair(): Promise<void> {
    const promise = new Promise<void>((resolve, _reject) => {
      if (!this.production) resolve();
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
            passphrase: this.secret,
          }
        },
        (_, publicKey, privateKey) => {
          Logger.warn('Wallet rsa key pair created');
          this.publicKey = publicKey;
          this.privateKey = privateKey;
          resolve()
        }
      );
    });
    await promise;
  }
}
