# Noob Cash Backend

## Development

start the app with `npm run serve` in development mode

use the following for development and debug

```
IS_BOOTSTRAP=true \
TOTAL_NODES=2 \
PORT=3001 \
BOOTSTRAP_NODE_URL=http://127.0.0.1:3001 \
NODE_URL=http://127.0.0.1:3001 \
BLOCK_CAPACITY=2 \
NODE_SECRET=secret1 \
MINING_INTERVAL=5000 \
DIFFICULTY=4 \
npm run serve

IS_BOOTSTRAP=false \
TOTAL_NODES=2 \
PORT=3002 \
BOOTSTRAP_NODE_URL=http://127.0.0.1:3001 \
NODE_URL=http://127.0.0.1:3002 \
BLOCK_CAPACITY=2 \
NODE_SECRET=secret2 \
MINING_INTERVAL=5000 \
DIFFICULTY=4 \
npm run serve
```

## Tests

to run the tests you have to edit the `config` file in `/scripts` directory.

then you will have to run
- `./start.sh` to create the nodes
- `./ignite.sh` to initialize them
- `./runTests.sh` to run the tests

and after they are finish you can kill them using `./killAll.sh`.

original

{"index":17,"timestamp":1647473464783,"transactions":[{"transactionInputs":[{"previousOutputId":"8ed17ffbec132f2eef7ee49b097cb5e0574cb3b93bedb793ae7829d43a7b3050","amount":4}],"transactionOutputs":[{"transactionId":"26ac33d98b99b73cf12ce6f82b94177633e69971865ab2ed5e1246e8d841994b","receiverAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwMOeYFzjASEU+g+uVUJJlqgC1WdK0MkW7W+VOJx9aWY1J606TEy5B7/lzXu\n01Vti7KHQCqeDCEW9AIZAYgSRCzIuasCAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","amount":4,"outputId":"f4d98b523c902f9aa6355d46addf2f4e789e2674d1041b52f45fa2a46293e6a3"}],"amount":4,"senderAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwLCvWsDVH8/GS+jcQeeBqQyysY4eOo8eGwyUrT1scjZfmbBGpwvJwdnFLZp\nByVsULdvJIBx662vdgj3g3t2AHoe91ECAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","receiverAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwMOeYFzjASEU+g+uVUJJlqgC1WdK0MkW7W+VOJx9aWY1J606TEy5B7/lzXu\n01Vti7KHQCqeDCEW9AIZAYgSRCzIuasCAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","timestamp":1647473461288,"transactionId":"26ac33d98b99b73cf12ce6f82b94177633e69971865ab2ed5e1246e8d841994b","signature":{"type":"Buffer","data":[0,73,130,205,94,125,232,5,150,188,44,44,27,1,237,115,243,117,100,27,178,189,236,33,63,137,93,114,64,20,156,186,133,31,6,135,76,162,128,64,245,47,98,5,99,131,4,53,3,222,169,20,159,29,248,106,102,1,161,127,162,169,211,34,77,72,35]}}],"nonce":2854704530,"previousHash":"00008b019ada7b662d438712e94a28dd7d331fcdcd23e3520842adcc65d32fb5"}

copy 

{"index":20,"timestamp":1647472322453,"transactions":[{"transactionInputs":[{"previousOutputId":"11fab1154c0c9e3fdcc3c91710c33688cfbc28169733a1b8b1a5aed954ac17a4","amount":8}],"transactionOutputs":[{"transactionId":"2c3951f4b9accac76b314fc48b1f9ab2ec3ca3a190b0fbff5eac0f0726f65516","receiverAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwMJpiDWzGiKc6fD1eGcT1xMkuGN66fvbgbYSwcVAHZUMZgPaMlevLNaEb5Z\n7FEZYRogKgiAbJzFFwC3KREhc9UihNUCAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","amount":1,"outputId":"3424ad452fe4d7ede43181497a64503c6a492fc0c50e373749353361c7f9de4d"},{"transactionId":"2c3951f4b9accac76b314fc48b1f9ab2ec3ca3a190b0fbff5eac0f0726f65516","receiverAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwMRnomQMf/DD9SvZDxIBkfwqbx04NgnwUzFgmYYViPK6c1Essv/pHDZJWQx\ntc2blZ0FzZA9KBUAdWm7wTMfPNucVi8CAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","amount":7,"outputId":"c92c8e695c257778409a5d27a5e56aa740a1fd0ce296ddbffa0df170ca3fa19f"}],"amount":1,"senderAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwMRnomQMf/DD9SvZDxIBkfwqbx04NgnwUzFgmYYViPK6c1Essv/pHDZJWQx\ntc2blZ0FzZA9KBUAdWm7wTMfPNucVi8CAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","receiverAddress":"-----BEGIN RSA PUBLIC KEY-----\nMEoCQwMJpiDWzGiKc6fD1eGcT1xMkuGN66fvbgbYSwcVAHZUMZgPaMlevLNaEb5Z\n7FEZYRogKgiAbJzFFwC3KREhc9UihNUCAwEBAQ==\n-----END RSA PUBLIC KEY-----\n","timestamp":1647472317627,"transactionId":"2c3951f4b9accac76b314fc48b1f9ab2ec3ca3a190b0fbff5eac0f0726f65516","signature":{"type":"Buffer","data":[1,111,27,119,78,199,189,40,32,137,38,71,139,238,186,37,109,116,153,197,7,17,79,46,68,166,47,153,244,108,192,76,61,98,45,125,62,233,115,228,217,1,235,85,15,216,197,242,86,118,188,68,245,126,161,116,142,254,37,39,26,124,29,168,34,65,224]}}],"nonce":6838658766,"previousHash":"000074e80612eb0c36f28cf8ddda0df83fdcc3ec1a4ce943330ecbd8fcc97dd1"}


