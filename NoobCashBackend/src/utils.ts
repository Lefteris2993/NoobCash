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

export class Logger {
  public static info(...data: any) {
    console.log(`\x1b[32m[Timestamp]: ${(new Date).toISOString()} `, ...data , `\x1b[0m`);
  }

  public static warn(...data: any) {
    console.log(`\x1b[33m[Timestamp]: ${(new Date).toISOString()} `, ...data , `\x1b[0m`);
  }

  public static error(...data: any) {
    console.log(`\x1b[31m[Timestamp]: ${(new Date).toISOString()} `, ...data ,` \x1b[0m`);
  }
}

export class Queue<T> {
  private queue: T[] = [];

  public empty(): boolean {
    return this.queue.length === 0;
  }

  public size(): number {
    return this.queue.length;
  }

  public enQueue(item: T): void {
    this.queue.push(item);
  }

  public peek(): T | undefined {
    return this.queue[0];
  }

  public deQueue(): T | undefined {
    return this.queue.shift();
  }
}
