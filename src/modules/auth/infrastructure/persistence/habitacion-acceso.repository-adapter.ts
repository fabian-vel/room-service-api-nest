import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import type { HabitacionAcceso } from '../../domain/model/habitacion-acceso.js';
import { HabitacionAccesoRepository } from '../../domain/port/habitacion-acceso.repository.js';
import { mapHabitacionAccesoRow } from '../mapper/habitacion-acceso.row-mapper.js';

@Injectable()
export class HabitacionAccesoRepositoryAdapter implements HabitacionAccesoRepository {
  private readonly sqlAcceso = loadSql('querys/consultar-acceso.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultaHabitacionAcceso(
    habitacion: string,
    codigo: string,
  ): Promise<HabitacionAcceso | null> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.sqlAcceso,
      { habitacion, codigo },
      'Error al consultar acceso',
    );
    return rows.length ? mapHabitacionAccesoRow(rows[0]) : null;
  }
}
