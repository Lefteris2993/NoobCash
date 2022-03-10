# Noob Cash Backend

## Development

start the app with `npm run serve` in development mode

use the following for development and debug

```
IS_BOOTSTRAP=true \
DIFFICULTY=4 \
TOTAL_NODES=2 \
PORT=3001 \
BOOTSTRAP_NODE_URL=http://127.0.0.1:3001 \
NODE_URL=http://127.0.0.1:3001 \
BLOCK_CAPACITY=2 \
NODE_SECRET=secret1 \
npm run serve

IS_BOOTSTRAP=false \
DIFFICULTY=4 \
TOTAL_NODES=2 \
PORT=3002 \
BOOTSTRAP_NODE_URL=http://127.0.0.1:3001 \
NODE_URL=http://127.0.0.1:3002 \
BLOCK_CAPACITY=2 \
NODE_SECRET=secret2 \
npm run serve
```

