import dotenv from 'dotenv';

dotenv.config()

export const configuration = {
  isBootstrap: process.env.IS_BOOTSTRAP === 'true' || false,
  difficulty: Number(process.env.DIFFICULTY || 4),
  capacity: Number(process.env.CAPACITY || 4),
  port: Number(process.env.PORT || 3000),
}

console.log(configuration);
console.log(process.env);
