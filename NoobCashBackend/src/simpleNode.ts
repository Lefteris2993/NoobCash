import axios from "axios";
import { Request, Response } from 'express';
import { configuration } from "./configuration";
import { NodeInfo } from "./interfaces";
import { NoobCashNode } from "./NoobCashNode";

export class SimpleNode extends NoobCashNode {

  constructor() {
    super();
  }
  
  
  public ignite (_: Request, res: Response) {
    while (true) {
      try {
        let response = axios.post(`${configuration.bootstrapNodeUrl}/register`, {
          url: configuration.url,
          publicKey: this.wallet.publicKey,
        })
        console.log(response);
        break;
      } catch (error) {
        // Do nothing
      }
    }
    res.status(200);
  }

  public register(_: Request<any, any, NodeInfo>, res: Response): void {
    res.status(418).send('I am a teapot');
  }
}
