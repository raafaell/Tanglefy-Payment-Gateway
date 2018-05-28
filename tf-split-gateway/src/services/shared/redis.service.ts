import { createHandyClient, ICreateHandyClient, IHandyRedis } from 'handy-redis';
import { Service } from 'ts-express-decorators';
import { RedisClient } from 'redis';


const pendingPrefix = 'PENDING:';

@Service()
export class RedisService {
  static resource: IHandyRedis;

  static async connect(): Promise<RedisService> {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT;

    if (RedisService.resource) {
      return RedisService.resource;
    }

    const client = createHandyClient({host, port});
    RedisService.resource = client;

    return client;
  }


  static async getPendingTx(): Promise<any> {
    const pendingKeys = [];
    let keys;
    let cursor = 0;

    //TODO: fix the prefix scan
    [cursor, keys] = await RedisService.resource.scan(cursor);
    if (keys.length > 0) {
      console.log('keys are:', keys);
      keys.forEach(key => pendingKeys.push(key.replace(pendingPrefix, '')));
    }

    while (cursor > 0) {
      // [cursor, keys] = await RedisService.resource.scan(cursor, pendingPrefix);
      [cursor, keys] = await RedisService.resource.scan(cursor);
      if (keys.length > 0) {
        console.log('keys are:', keys);
        keys.forEach(key => pendingKeys.push(key.replace(pendingPrefix, '')));
      }
    }

    return pendingKeys;

    //Get the values for each key -actually we don't really want these
    // return Promise.all(pendingKeys.map(key => RedisService.resource.get(key)));
  }

  static async addPendingTx(transactionId: string): Promise<any> {
    return await RedisService.resource.set(`${pendingPrefix}${transactionId}`, 'true');
  }

  static async deletePendingTx(transactionId: string): Promise<any> {
    return await RedisService.resource.del(`${pendingPrefix}${transactionId}`);
  }

}
