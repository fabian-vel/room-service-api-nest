import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type {
  EmpleadoGuardar,
  EmpleadoMaestro,
} from '../../domain/model/empleado.js';
import { EmpleadoRepository } from '../../domain/port/empleado.repository.js';
import { mapEmpleadoRow } from '../mapper/empleado.row-mapper.js';

@Injectable()
export class EmpleadoRepositoryAdapter implements EmpleadoRepository {
  private readonly consultarTodos = loadSql(
    'querys/consultar-empleados-todos.sql',
  );
  private readonly insertar = loadSql('querys/insertar-empleado.sql');
  private readonly actualizar = loadSql('querys/actualizar-empleado.sql');
  private readonly eliminar = loadSql('querys/eliminar-empleado.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarEmpleados(): Promise<EmpleadoMaestro[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.consultarTodos,
      {},
      'Error al consultar empleados en BD',
    );
    return rows.map(mapEmpleadoRow);
  }

  async insertarEmpleado(empleado: EmpleadoGuardar): Promise<number | null> {
    const { rows } = await ejecutarSql<{ empl_id: number }>(
      this.pool,
      this.insertar,
      {
        usuario: empleado.emplUsuario,
        password: empleado.emplPassword,
        nombre: empleado.emplNombre,
        rol: empleado.emplRol,
      },
      'Error al insertar empleado en BD',
    );
    return rows[0]?.empl_id ?? null;
  }

  async actualizarEmpleado(
    empleado: EmpleadoGuardar,
    usuarioSesion: string,
  ): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.actualizar,
      {
        emplId: empleado.emplId,
        nombre: empleado.emplNombre,
        rol: empleado.emplRol,
        password: empleado.emplPassword,
        usuarioSesion,
      },
      'Error al actualizar empleado en BD',
    );
    return rowCount ?? 0;
  }

  async eliminarEmpleado(
    emplId: number,
    usuarioSesion: string,
  ): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.eliminar,
      { emplId, usuarioSesion },
      'Error al eliminar empleado en BD',
    );
    return rowCount ?? 0;
  }
}
