import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Etiqueta } from '../../../etiqueta/domain/model/etiqueta.js';
import type { MenuItem } from '../../domain/model/menu-item.js';
import { MenuItemRepository } from '../../domain/port/menu-item.repository.js';

@Injectable()
export class MenuItemRepositoryAdapter implements MenuItemRepository {
  private readonly sql = loadSql('querys/consultar-menu-items.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultaMenuItemsPorCategoria(mecaId: number): Promise<MenuItem[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sql,
      { MECA_ID: mecaId },
      'Error al consultar menu en BD',
    );
    return rows.map((row) => ({
      meitId: row.meit_id,
      meitNombre: row.meit_nombre,
      meitDescripcion: row.meit_descripcion ?? null,
      meitPrecio: row.meit_precio == null ? 0 : Number(row.meit_precio), // numeric llega como texto
      meitImagenUrl: row.meit_imagen_url ?? null,
      mecaId: row.meca_id,
      mecaParentId: row.meca_parent_id ?? null,
      // la consulta no trae llave ni estado de la etiqueta (en Java también salían en null)
      etiquetas: (row.etiquetas ?? []).map(
        (etiqueta: Partial<Etiqueta>): Etiqueta => ({
          etiqId: etiqueta.etiqId ?? null,
          etiqLlaveMst: null,
          etiqNombre: etiqueta.etiqNombre!,
          etiqDescripcion: etiqueta.etiqDescripcion ?? null,
          etiqEstado: null,
        }),
      ),
    }));
  }
}
