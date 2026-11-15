import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Etiqueta } from '../../../etiqueta/domain/model/etiqueta.js';
import type {
  MenuItem,
  MenuItemGuardar,
  MenuItemMaestro,
} from '../../domain/model/menu-item.js';
import { MenuItemRepository } from '../../domain/port/menu-item.repository.js';

@Injectable()
export class MenuItemRepositoryAdapter implements MenuItemRepository {
  private readonly sql = loadSql('querys/consultar-menu-items.sql');
  private readonly sqlTodos = loadSql('querys/consultar-menu-items-todos.sql');
  private readonly sqlInsertar = loadSql('querys/insertar-menu-item.sql');
  private readonly sqlActualizar = loadSql('querys/actualizar-menu-item.sql');
  private readonly sqlEliminar = loadSql('querys/eliminar-menu-item.sql');
  private readonly sqlDesactivarEtiquetas = loadSql(
    'querys/desactivar-etiquetas-item.sql',
  );
  private readonly sqlActivarEtiquetas = loadSql(
    'querys/activar-etiquetas-item.sql',
  );

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarItems(): Promise<MenuItemMaestro[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlTodos,
      {},
      'Error al consultar los ítems en BD',
    );
    return rows.map((row) => ({
      meitId: row.meit_id,
      meitNombre: row.meit_nombre,
      meitDescripcion: row.meit_descripcion ?? null,
      meitPrecio: Number(row.meit_precio), // numeric llega como texto
      meitImagenUrl: row.meit_imagen_url ?? null,
      mecaId: row.meca_id,
      mecaNombre: row.meca_nombre,
      mecaParentId: row.meca_parent_id ?? null,
      mecaParentNombre: row.meca_parent_nombre ?? null,
      etiquetas: row.etiquetas ?? [],
    }));
  }

  async insertarItem(item: MenuItemGuardar): Promise<number | null> {
    const { rows } = await ejecutarSql<{ meit_id: number }>(
      this.pool,
      this.sqlInsertar,
      parametrosItem(item),
      'Error al insertar el ítem en BD',
    );
    return rows[0]?.meit_id ?? null;
  }

  async actualizarItem(item: MenuItemGuardar): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.sqlActualizar,
      { ...parametrosItem(item), meitId: item.meitId },
      'Error al actualizar el ítem en BD',
    );
    return rowCount ?? 0;
  }

  async eliminarItem(meitId: number): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.sqlEliminar,
      { meitId },
      'Error al eliminar el ítem en BD',
    );
    return rowCount ?? 0;
  }

  async reemplazarEtiquetas(meitId: number, etiqIds: number[]): Promise<void> {
    const parametros = { meitId, etiqIds };
    const mensaje = 'Error al guardar las etiquetas del ítem en BD';
    await ejecutarSql(
      this.pool,
      this.sqlDesactivarEtiquetas,
      parametros,
      mensaje,
    );
    await ejecutarSql(this.pool, this.sqlActivarEtiquetas, parametros, mensaje);
  }

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
      // la consulta no trae llave ni estado de la etiqueta
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

function parametrosItem(item: MenuItemGuardar) {
  return {
    nombre: item.meitNombre,
    descripcion: item.meitDescripcion,
    precio: item.meitPrecio,
    imagenUrl: item.meitImagenUrl,
    mecaId: item.mecaId,
  };
}
