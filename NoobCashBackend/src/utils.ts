import { createHash } from "crypto";

export function hash(data: any): string {
  return createHash('sha256')
    .update(JSON.stringify(data))
    .digest('hex');
}
