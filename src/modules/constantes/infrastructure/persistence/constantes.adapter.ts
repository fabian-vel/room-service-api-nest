import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Constantes } from '../../domain/model/constantes.js';
import { ConstantesRepository } from '../../domain/port/constantes.repository.js';
import { mapConstantesRow } from '../mapper/constantes.row-mapper.js';

@Injectable()
export class ConstantesAdapter implements ConstantesRepository {
  private readonly consultarTodos = loadSql(
    'querys/consultar-constantes-todos.sql',
  );
  private readonly insertar = loadSql('querys/insertar-constante.sql');
  private readonly actualizar = loadSql('querys/actualizar-constante.sql');
  private readonly eliminar = loadSql('querys/eliminar-constante.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarConstantes(): Promise<Constantes[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.consultarTodos,
      {},
      'Error al consultar constantes en BD',
    );
    return rows.map(mapConstantesRow);
  }

  async insertarConstante(constante: Constantes): Promise<number> {
    const { rows } = await ejecutarSql<{ cons_id: number }>(
      this.pool,
      this.insertar,
      {
        llave: constante.consLlave,
        valor: constante.consValor,
        descripcion: constante.consDescripcion,
      },
      'Error al insertar constante en BD',
    );
    return rows[0].cons_id;
  }

  async actualizarConstante(constante: Constantes): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.actualizar,
      {
        consId: constante.consId,
        llave: constante.consLlave,
        valor: constante.consValor,
        descripcion: constante.consDescripcion,
      },
      'Error al actualizar constante en BD',
    );
    return rowCount ?? 0;
  }

  async eliminarConstante(consId: number): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.eliminar,
      { consId },
      'Error al eliminar constante en BD',
    );
    return rowCount ?? 0;
  }
}
