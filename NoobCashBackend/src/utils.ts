import { createHash } from "crypto";

export function hash(data: any): string {
  return createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}

export class NoobCashError extends Error {
  public status!: number;
  public message!: string;

  constructor(message: string = '', status: number = 400) {
    super();
    this.message = message;
    this.status = status;
  }
}
