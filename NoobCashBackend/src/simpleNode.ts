import axios from "axios";
import { Request, Response } from 'express';
import { configuration } from "./configuration";
import { NodeInfo, NoobCashBlockChain, PostRegisterResponseDTO, UTXO } from "./interfaces";
import { NoobCashNode } from "./NoobCashNode";
import { NoobCashError } from "./utils";

export class SimpleNode extends NoobCashNode {

  constructor() {
    super();
  }
  
  
  public async ignite (): Promise<void> {
    while (true) {
      try {
        let response = await axios.post(`${configuration.bootstrapNodeUrl}/register`, {
          url: configuration.url,
          publicKey: this.wallet.publicKey,
        })
        console.log(response);
        break;
      } catch (error) {
        // Do nothing
      }
    }
  }

  public register(_: NodeInfo): PostRegisterResponseDTO {
    throw new NoobCashError('I am a teapot', 418);
  }

  public info(nodeInfo: NodeInfo[], utxos: UTXO[], chain: NoobCashBlockChain) {
    throw new NoobCashError('Not implemented', 501);
  }
}
