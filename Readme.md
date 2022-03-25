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
