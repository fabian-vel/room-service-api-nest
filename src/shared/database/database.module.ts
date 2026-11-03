import {
  Global,
  Inject,
  Logger,
  Module,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import { Pool } from 'pg';

export const PG_POOL = Symbol('PG_POOL');

@Global()
@Module({
  providers: [
    {
      provide: PG_POOL,
      useFactory: () =>
        new Pool({
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT ?? 5432),
          database: process.env.DB_NAME,
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          max: 20,
          idleTimeoutMillis: 30 * 60 * 1000,
        }),
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule implements OnModuleInit, OnApplicationShutdown {
  private readonly logger = new Logger(DatabaseModule.name);

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  // falla al arrancar si la BD no responde, en vez de esperar a la primera petición
  async onModuleInit() {
    await this.pool.query('SELECT 1');
    this.logger.log(
      `Conectado a ${process.env.DB_NAME}@${process.env.DB_HOST}`,
    );
  }

  async onApplicationShutdown() {
    await this.pool.end();
  }
}
