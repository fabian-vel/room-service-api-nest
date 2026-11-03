import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { MenuCategoria } from '../../domain/model/menu-categoria.js';
import type { MenuCategoriaRow } from '../../domain/model/menu-categoria-row.js';
import { MenuCategoriaRepository } from '../../domain/port/menu-categoria.repository.js';
import {
  mapMenuCategoria,
  mapMenuCategoriaRow,
} from '../mapper/menu-categoria.row-mapper.js';

@Injectable()
export class MenuCategoriaRepositoryAdapter implements MenuCategoriaRepository {
  private readonly sql = loadSql('querys/consultar-categoria.sql');
  private readonly consultarTodas = loadSql(
    'querys/consultar-menu-categorias-todos.sql',
  );
  private readonly insertar = loadSql('querys/insertar-menu-categoria.sql');
  private readonly actualizar = loadSql('querys/actualizar-menu-categoria.sql');
  private readonly eliminar = loadSql('querys/eliminar-menu-categoria.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarCategorias(): Promise<MenuCategoriaRow[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sql,
      {},
      'Error al consultar categorías en BD',
    );
    return rows.map(mapMenuCategoriaRow);
  }

  async consultarCategoriasTodas(): Promise<MenuCategoria[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.consultarTodas,
      {},
      'Error al consultar todas las categorías en BD',
    );
    return rows.map(mapMenuCategoria);
  }

  async insertarCategoria(categoria: MenuCategoria): Promise<number> {
    const { rows } = await ejecutarSql<{ meca_id: number }>(
      this.pool,
      this.insertar,
      this.parametros(categoria),
      'Error al insertar categoría en BD',
    );
    return rows[0].meca_id;
  }

  async actualizarCategoria(categoria: MenuCategoria): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.actualizar,
      { mecaId: categoria.mecaId, ...this.parametros(categoria) },
      'Error al actualizar categoría en BD',
    );
    return rowCount ?? 0;
  }

  async eliminarCategoria(mecaId: number): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.eliminar,
      { mecaId },
      'Error al eliminar categoría en BD',
    );
    return rowCount ?? 0;
  }

  private parametros(categoria: MenuCategoria) {
    return {
      llaveMst: categoria.mecaLlaveMst,
      nombre: categoria.mecaNombre,
      descripcion: categoria.mecaDescripcion,
      imagenUrl: categoria.mecaImagenUrl,
      parentId: categoria.mecaParentId,
    };
  }
}
