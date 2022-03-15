import dotenv from 'dotenv';

dotenv.config()

export const configuration = {
  isBootstrap: process.env.IS_BOOTSTRAP === 'true',
  difficulty: Number(process.env.DIFFICULTY || 4),
  totalNodes: Number(process.env.TOTAL_NODES || 5),
  port: Number(process.env.PORT || 3000),
  url: process.env.NODE_URL || 'http://192.168.0.1:3000',
  bootstrapNodeUrl: process.env.BOOTSTRAP_NODE_URL || 'http://localhost:3000',
  secret: process.env.NODE_SECRET || 'secret',
  blockCapacity: Number(process.env.BLOCK_CAPACITY || 4),
  production: process.env.PRODUCTION === 'true',
  miningInterval: Number(process.env.MINING_INTERVAL || 5000),
}
