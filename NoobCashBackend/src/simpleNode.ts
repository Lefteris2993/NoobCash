import axios from "axios";
import { configuration } from "./configuration";
import { NodeInfo, NoobCashBlockChain, PostRegisterDTO, PostRegisterResponseDTO, UTXO } from "./interfaces";
import { NoobCashNode } from "./NoobCashNode";
import { NoobCashError } from "./utils";

export class SimpleNode extends NoobCashNode {

  constructor() {
    super();
  }

  public async ignite (): Promise<void> {
    while (true) {
      try {
        const data: PostRegisterDTO = {
          nodeInfo: {
            url: configuration.url,
            publicKey: this.wallet.publicKey,
          }
        }
        let response = await axios.post<PostRegisterResponseDTO>(`${configuration.bootstrapNodeUrl}/register`, data);
        this.nodeId = response.data.nodeId;
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
    this.nodesInfo = nodeInfo;
    this.UTXOs = utxos;
    this.blockChain = chain;
  }
}
