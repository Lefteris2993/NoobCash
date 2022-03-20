import axios from "axios";
import { configuration } from "./configuration";
import { NodeInfo, NoobCashBlock, PostRegisterDTO, PostRegisterResponseDTO, UTXO } from "./interfaces";
import { NoobCashNode } from "./NoobCashNode";
import { NoobCashError } from "./utils";

export class SimpleNode extends NoobCashNode {

  constructor() {
    super();
    if (!configuration.production) {
      this.wallet.publicKey = `-----BEGIN RSA PUBLIC KEY-----
MEoCQwNhFtNcV+GCba7VC34llMZHP+/HDkIwIar2omnLd3d+pDRpW+wCKNomtSf2
5Q+TuZGbDN/8cstyclYNgLZqZxnQMi8CAwEBAQ==
-----END RSA PUBLIC KEY-----`;
      this.wallet.privateKey = `-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIBzTBXBgkqhkiG9w0BBQ0wSjApBgkqhkiG9w0BBQwwHAQIqLu0fqC049MCAggA
MAwGCCqGSIb3DQIJBQAwHQYJYIZIAWUDBAEqBBBcdz8lnQizQNYqNUaeS2d+BIIB
cC1VQoBQEOn5h50gvoqBsO6Az3uULPCBCB9H85WxyQJ6zpPrBri2gpDuGMY7jEsM
Zx3EC0lBBYBbFDVLMNhq4XezXtx2rv4ixdRmK2QU3X1YnatBfXtlUswyTuHxvm/+
7FD85YOUT2E6ComF/embb37hGsrjeaMM2GEAqitOIJ4FSplFhBynPwa6WXkSsEDT
1Sb/y2Ui0Sn/i8tATFjbZAtkrX378wMILY1zMllHLvsemoBWyg0PRi93Y4gNrom6
rSMaQjC33qvfXxsF/fP4UG2PSYKh1ohmDf2xAY1NV0NLv7m5qZGOVb+q3oPBIc8t
mt7+yg5uFuHy+MczhJ+K3gBv6z3Bkd1YLXDKO9a5a3YcssckrjC/jAVzrPcYPhF1
O+raX8dJ3OrSkJ73TzNpwqg3P1sI5zZyE2xRhAazaIRxSZ7xHvQpXhZQhwuNc5Az
IkY2MMH7ICoWqZmh69dOasUDMk8fD+J7fCSMl6I5z4qW
-----END ENCRYPTED PRIVATE KEY-----`;
    }
  }

  public async ignite (): Promise<void> {
    if (this.ignited) throw new NoobCashError('Already ignited', 400);
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
    this.ignited = true;
  }

  public register(_: NodeInfo): PostRegisterResponseDTO {
    throw new NoobCashError('I am a teapot', 418);
  }

  public info(nodeInfo: NodeInfo[], genesisBlock: NoobCashBlock) {
    this.nodesInfo = nodeInfo;
    this.chainService.addGenesis(genesisBlock);
  }
}
