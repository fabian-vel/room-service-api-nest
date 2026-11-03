import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module.js';
import { ConstantesModule } from './modules/constantes/constantes.module.js';
import { EtiquetaModule } from './modules/etiqueta/etiqueta.module.js';
import { MenuCategoriaModule } from './modules/menu-categoria/menu-categoria.module.js';

@Module({
  // aquí se registran los módulos de cada contexto a medida que se migran
  imports: [
    DatabaseModule,
    ConstantesModule,
    EtiquetaModule,
    MenuCategoriaModule,
  ],
})
export class AppModule {}
