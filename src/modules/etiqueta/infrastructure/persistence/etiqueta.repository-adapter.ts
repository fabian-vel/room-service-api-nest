import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Etiqueta } from '../../domain/model/etiqueta.js';
import type { EtiquetaRequest } from '../../domain/model/etiqueta-request.js';
import { EtiquetaRepository } from '../../domain/port/etiqueta.repository.js';
import { mapEtiquetaRow } from '../mapper/etiqueta.row-mapper.js';

@Injectable()
export class EtiquetaRepositoryAdapter implements EtiquetaRepository {
  private readonly consultaPorItem = loadSql(
    'querys/consulta-etiqueta-x-item.sql',
  );
  private readonly consultaPorCategoria = loadSql(
    'querys/consulta-etiqueta-x-categoria.sql',
  );
  private readonly consultarTodos = loadSql(
    'querys/consultar-etiquetas-todos.sql',
  );
  private readonly insertar = loadSql('querys/insertar-etiqueta.sql');
  private readonly actualizar = loadSql('querys/actualizar-etiqueta.sql');
  private readonly eliminar = loadSql('querys/eliminar-etiqueta.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultaEtiqueta(request: EtiquetaRequest): Promise<Etiqueta[]> {
    const { rows } = request.consultaPorCategoria
      ? await ejecutarSql(
          this.pool,
          this.consultaPorCategoria,
          { MECA_ID: request.mecaId },
          'Error al consultar etiquetas',
        )
      : await ejecutarSql(
          this.pool,
          this.consultaPorItem,
          { MEIT_ID: request.meitId },
          'Error al consultar etiquetas',
        );
    return rows.map(mapEtiquetaRow);
  }

  async consultarEtiquetas(): Promise<Etiqueta[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.consultarTodos,
      {},
      'Error al consultar etiquetas en BD',
    );
    return rows.map(mapEtiquetaRow);
  }

  async insertarEtiqueta(etiqueta: Etiqueta): Promise<number> {
    const { rows } = await ejecutarSql<{ etiq_id: number }>(
      this.pool,
      this.insertar,
      {
        llaveMst: etiqueta.etiqLlaveMst,
        nombre: etiqueta.etiqNombre,
        descripcion: etiqueta.etiqDescripcion,
      },
      'Error al insertar etiqueta en BD',
    );
    return rows[0].etiq_id;
  }

  async actualizarEtiqueta(etiqueta: Etiqueta): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.actualizar,
      {
        etiqId: etiqueta.etiqId,
        llaveMst: etiqueta.etiqLlaveMst,
        nombre: etiqueta.etiqNombre,
        descripcion: etiqueta.etiqDescripcion,
      },
      'Error al actualizar etiqueta en BD',
    );
    return rowCount ?? 0;
  }

  async eliminarEtiqueta(etiqId: number): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.eliminar,
      { etiqId },
      'Error al eliminar etiqueta en BD',
    );
    return rowCount ?? 0;
  }
}
