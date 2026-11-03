import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { Empleado } from '../../domain/model/empleado.js';
import { EmpleadoRepository } from '../../domain/port/empleado.repository.js';

@Injectable()
export class EmpleadoRepositoryAdapter implements EmpleadoRepository {
  private readonly sql = loadSql('querys/consultar-empleado.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async findByUsuario(usuario: string): Promise<Empleado | null> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sql,
      { usuario },
      'Error al consultar empleado en BD',
    );
    if (!rows.length) return null;
    const row = rows[0];
    return {
      emplId: row.empl_id,
      emplUsuario: row.empl_usuario,
      emplPassword: row.empl_password,
      emplNombre: row.empl_nombre,
      emplRol: row.empl_rol,
    };
  }
}
