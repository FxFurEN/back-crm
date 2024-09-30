import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async setToken(email: string, token: string, expiration: number) {
    await this.client.set(token, email, 'EX', expiration);
  }

  async getEmailByToken(token: string) {
    return await this.client.get(token);
  }

  async deleteToken(token: string) {
    await this.client.del(token);
  }
}
