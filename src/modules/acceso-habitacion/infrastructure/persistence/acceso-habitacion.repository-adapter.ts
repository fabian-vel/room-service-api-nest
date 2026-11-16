import { Inject, Injectable } from '@nestjs/common';
import type { Pool } from 'pg';
import { PG_POOL } from '../../../../shared/database/database.module.js';
import { ejecutarSql } from '../../../../shared/database/sql.util.js';
import { loadSql } from '../../../../shared/util/sql-loader.util.js';
import { mapHabitacionAccesoRow } from '../../../auth/infrastructure/mapper/habitacion-acceso.row-mapper.js';
import type {
  AccesoGuardar,
  AccesoHabitacion,
} from '../../domain/model/acceso-habitacion.js';
import { AccesoHabitacionRepository } from '../../domain/port/acceso-habitacion.repository.js';

@Injectable()
export class AccesoHabitacionRepositoryAdapter implements AccesoHabitacionRepository {
  private readonly consultar = loadSql('querys/consultar-accesos.sql');
  // la misma consulta por id que usa /fechas-acceso
  private readonly porId = loadSql('querys/consulta-fecha-acceso.sql');
  private readonly traslape = loadSql('querys/existe-traslape-acceso.sql');
  private readonly disponible = loadSql('querys/codigo-acceso-disponible.sql');
  private readonly insertar = loadSql('querys/insertar-acceso.sql');
  private readonly actualizar = loadSql('querys/actualizar-acceso.sql');
  private readonly cambiar = loadSql('querys/cambiar-codigo-acceso.sql');
  private readonly finalizar = loadSql('querys/finalizar-acceso.sql');

  constructor(@Inject(PG_POOL) private readonly pool: Pool) {}

  async consultarAccesos(
    habitacion: string | null,
  ): Promise<AccesoHabitacion[]> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.consultar,
      { habitacion },
      'Error al consultar los accesos de habitación en BD',
    );
    // misma fila que usa el login del huésped
    return rows.map(mapHabitacionAccesoRow);
  }

  async consultarAcceso(haacId: number): Promise<AccesoHabitacion | null> {
    const { rows } = await ejecutarSql(
      this.pool,
      this.porId,
      { HAAC_ID: haacId },
      'Error al consultar el acceso en BD',
    );
    return rows.length ? mapHabitacionAccesoRow(rows[0]) : null;
  }

  async existeTraslape(
    acceso: AccesoGuardar,
    excluirId: number | null,
  ): Promise<boolean> {
    const { rows } = await ejecutarSql<{ existe: boolean }>(
      this.pool,
      this.traslape,
      {
        habitacion: acceso.haacHabitacion,
        fechaInicio: acceso.haacFechaInicio,
        fechaFin: acceso.haacFechaFin,
        excluirId,
      },
      'Error al validar las fechas del acceso en BD',
    );
    return rows[0].existe;
  }

  async codigoDisponible(codigo: string): Promise<boolean> {
    const { rows } = await ejecutarSql<{ disponible: boolean }>(
      this.pool,
      this.disponible,
      { codigo },
      'Error al validar el código de acceso en BD',
    );
    return rows[0].disponible;
  }

  async insertarAcceso(acceso: AccesoGuardar, codigo: string): Promise<number> {
    const { rows } = await ejecutarSql<{ haac_id: string }>(
      this.pool,
      this.insertar,
      { ...this.parametros(acceso), habitacion: acceso.haacHabitacion, codigo },
      'Error al registrar el acceso en BD',
    );
    return Number(rows[0].haac_id);
  }

  async actualizarAcceso(acceso: AccesoGuardar): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.actualizar,
      { ...this.parametros(acceso), haacId: acceso.haacId },
      'Error al actualizar el acceso en BD',
    );
    return rowCount ?? 0;
  }

  async cambiarCodigo(haacId: number, codigo: string): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.cambiar,
      { haacId, codigo },
      'Error al cambiar el código de acceso en BD',
    );
    return rowCount ?? 0;
  }

  async finalizarAcceso(haacId: number): Promise<number> {
    const { rowCount } = await ejecutarSql(
      this.pool,
      this.finalizar,
      { haacId },
      'Error al finalizar el acceso en BD',
    );
    return rowCount ?? 0;
  }

  private parametros(acceso: AccesoGuardar) {
    return {
      clienteNombre: acceso.haacClienteNombre,
      clienteDoc: acceso.haacClienteDoc,
      fechaInicio: acceso.haacFechaInicio,
      fechaFin: acceso.haacFechaFin,
    };
  }
}
