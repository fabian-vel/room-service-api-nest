import { Module } from '@nestjs/common';
import { DatabaseModule } from './shared/database/database.module.js';
import { SecurityModule } from './shared/security/security.module.js';
import { AuthModule } from './modules/auth/auth.module.js';
import { ConstantesModule } from './modules/constantes/constantes.module.js';
import { PedidoModule } from './modules/pedido/pedido.module.js';
import { MenuItemModule } from './modules/menu-item/menu-item.module.js';
import { ItemsEspecialesModule } from './modules/items-especiales/items-especiales.module.js';
import { EtiquetaModule } from './modules/etiqueta/etiqueta.module.js';
import { MenuCategoriaModule } from './modules/menu-categoria/menu-categoria.module.js';

@Module({
  // un módulo por contexto (ver README)
  imports: [
    DatabaseModule,
    SecurityModule,
    AuthModule,
    ConstantesModule,
    EtiquetaModule,
    MenuCategoriaModule,
    PedidoModule,
    MenuItemModule,
    ItemsEspecialesModule,
  ],
})
export class AppModule {}
