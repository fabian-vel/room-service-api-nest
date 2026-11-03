import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { ItemEspecial } from '../../domain/model/items-especiales.js';
import { ItemsEspecialesRepository } from '../../domain/port/items-especiales.repository.js';

const mapItemEspecial = (row: Record<string, any>): ItemEspecial => ({
  meitId: row.meit_id,
  meitNombre: row.meit_nombre,
  meitImagenUrl: row.meit_imagen_url ?? null,
  meitPrecio: Number(row.meit_precio), // numeric llega como texto
});

@Injectable()
export class ItemsEspecialesAdapter implements ItemsEspecialesRepository {
  private readonly sqlMasPedidos = loadSql('querys/items_mas_pedidos.sql');
  private readonly sqlMasRecientes = loadSql('querys/items_mas_recientes.sql');
  private readonly sqlRecomendados = loadSql(
    'querys/items_recomendados_chef.sql',
  );

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarItemsMasPedidos(cantidad: number): Promise<ItemEspecial[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlMasPedidos,
      { CANTIDAD: cantidad },
      'Error al consultar items mas pedidos',
    );
    return rows.map(mapItemEspecial);
  }

  async consultarItemsMasRecientes(cantidad: number): Promise<ItemEspecial[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlMasRecientes,
      { CANTIDAD: cantidad },
      'Error al consultar items mas recientes',
    );
    return rows.map(mapItemEspecial);
  }

  async consultarItemsRecomendadosChef(
    cantidad: number,
    etiqueta: number,
  ): Promise<ItemEspecial[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlRecomendados,
      { CANTIDAD: cantidad, ETIQUETA: etiqueta },
      'Error al consultar items recomendados por el chef',
    );
    return rows.map(mapItemEspecial);
  }
}
