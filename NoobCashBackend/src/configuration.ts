import dotenv from 'dotenv';

dotenv.config()

export const configuration = {
  isBootstrap: process.env.IS_BOOTSTRAP === 'true' || false,
  difficulty: Number(process.env.DIFFICULTY || 4),
  totalNodes: Number(process.env.CAPACITY || 5),
  port: Number(process.env.PORT || 3000),
  url: process.env.NODE_IP || 'http://192.168.0.1:3000',
  bootstrapNodeUrl: process.env.BOOTSTRAP_NODE_URL || 'http://localhost:3000',
  secret: process.env.NODE_SECRET || 'secret',
}
