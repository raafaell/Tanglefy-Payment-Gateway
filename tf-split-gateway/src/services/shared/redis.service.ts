import { createHandyClient } from 'handy-redis';
import { Service } from 'ts-express-decorators';
import { RedisClient } from 'redis';

@Service()
export class RedisService {
  static resource: RedisService;

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
}
