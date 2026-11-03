import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module.js';
import { SecurityModule } from './shared/security/security.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ConstantesModule } from './modules/constantes/constantes.module.js';
import { ConsultaPedidoModule } from './modules/consulta-pedido/consulta-pedido.module.js';
import { PedidoModule } from './modules/pedido/pedido.module.js';
import { EtiquetaModule } from './modules/etiqueta/etiqueta.module.js';
import { MenuCategoriaModule } from './modules/menu-categoria/menu-categoria.module.js';

@Module({
  // aquí se registran los módulos de cada contexto a medida que se migran
  imports: [
    DatabaseModule,
    SecurityModule,
    AuthModule,
    ConstantesModule,
    EtiquetaModule,
    MenuCategoriaModule,
    ConsultaPedidoModule,
    PedidoModule,
  ],
})
export class AppModule {}
