import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  constructor(@Inject('REDIS_CLIENT') private readonly client: Redis) {}

  async setToken(
    token: string,
    email: string,
    purpose: string,
    expiration: number,
  ) {
    const value = JSON.stringify({ email, purpose });
    await this.client.set(token, value, 'EX', expiration);
  }

  async getToken(token: string) {
    const value = await this.client.get(token);
    console.log(`Retrieved token for ${token}:`, value);
    return value ? JSON.parse(value) : null;
  }

  async deleteToken(token: string) {
    await this.client.del(token);
  }

  async getTokenByEmail(email: string) {
    const keys = await this.client.keys('*');
    for (const key of keys) {
      const value = await this.client.get(key);
      if (value === email) {
        return key;
      }
    }
    return null;
  }
}
