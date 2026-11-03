import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module.js';

@Module({
  // aquí se registran los módulos de cada contexto a medida que se migran
  imports: [DatabaseModule],
})
export class AppModule {}
