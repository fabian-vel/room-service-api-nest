import { randomInt } from 'node:crypto';
import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { InternalServerErrorException } from '../../../../shared/domain/exception/internal-server-error.exception.js';
import { esTextoVacio } from '../../../../shared/util/validacion.util.js';
import type {
  AccesoGuardar,
  AccesoHabitacion,
  AccesoRequest,
  CodigoAcceso,
} from '../../domain/model/acceso-habitacion.js';
import { AccesoHabitacionRepository } from '../../domain/port/acceso-habitacion.repository.js';

// sin 0/O ni 1/I/L: el huésped lo copia de un papel
const ALFABETO = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const LARGO_CODIGO = 6;
const INTENTOS_CODIGO = 5;

export function generarCodigo(): string {
  return Array.from(
    { length: LARGO_CODIGO },
    () => ALFABETO[randomInt(ALFABETO.length)],
  ).join('');
}

@Injectable()
export class AccesoHabitacionUseCase {
  constructor(private readonly accesoRepository: AccesoHabitacionRepository) {}

  consultarAccesos(habitacion?: string): Promise<AccesoHabitacion[]> {
    return this.accesoRepository.consultarAccesos(habitacion?.trim() || null);
  }

  async registrarAcceso(datos: AccesoRequest): Promise<CodigoAcceso> {
    const acceso = validarAcceso(datos, true);
    if (acceso.haacFechaFin <= new Date())
      throw new BusinessException('La fecha de fin ya pasó');
    await this.validarTraslape(acceso, null);
    const codigo = await this.codigoNuevo();
    const haacId = await this.accesoRepository.insertarAcceso(acceso, codigo);
    return { haacId, haacCodigo: codigo };
  }

  async actualizarAcceso(datos: AccesoRequest): Promise<number> {
    if (!Number.isInteger(datos.haacId))
      throw new BusinessException('El id del acceso es obligatorio');
    const acceso = validarAcceso(datos, false);
    // el traslape se valida contra la habitación guardada, no la que mande el cliente
    const actual = await this.accesoRepository.consultarAcceso(acceso.haacId!);
    if (actual?.haacEstado !== 'A')
      throw new BusinessException('Acceso no encontrado o finalizado');
    await this.validarTraslape(
      { ...acceso, haacHabitacion: actual.haacHabitacion },
      acceso.haacId,
    );
    const filas = await this.accesoRepository.actualizarAcceso(acceso);
    if (filas === 0)
      throw new BusinessException('Acceso no encontrado o finalizado');
    return filas;
  }

  /** Código nuevo para el mismo acceso (p. ej. si el huésped lo perdió); el anterior deja de servir para entrar */
  async renovarCodigo(haacId: number): Promise<CodigoAcceso> {
    const codigo = await this.codigoNuevo();
    const filas = await this.accesoRepository.cambiarCodigo(haacId, codigo);
    if (filas === 0)
      throw new BusinessException('Acceso no encontrado o finalizado');
    return { haacId, haacCodigo: codigo };
  }

  async finalizarAcceso(haacId: number): Promise<number> {
    const filas = await this.accesoRepository.finalizarAcceso(haacId);
    if (filas === 0)
      throw new BusinessException('Acceso no encontrado o ya finalizado');
    return filas;
  }

  private async validarTraslape(
    acceso: AccesoGuardar,
    excluirId: number | null,
  ) {
    if (await this.accesoRepository.existeTraslape(acceso, excluirId))
      throw new BusinessException(
        'La habitación ya tiene un acceso activo que se cruza con esas fechas',
      );
  }

  private async codigoNuevo(): Promise<string> {
    for (let i = 0; i < INTENTOS_CODIGO; i++) {
      const codigo = generarCodigo();
      if (await this.accesoRepository.codigoDisponible(codigo)) return codigo;
    }
    throw new InternalServerErrorException(
      'No se pudo generar un código de acceso',
      new Error(`${INTENTOS_CODIGO} códigos repetidos seguidos`),
    );
  }
}

function fechaValida(valor: unknown, campo: string): Date {
  const fecha = typeof valor === 'string' ? new Date(valor) : null;
  if (!fecha || Number.isNaN(fecha.getTime()))
    throw new BusinessException(`La ${campo} no es válida`);
  return fecha;
}

function texto(valor: unknown, campo: string, largo: number): string | null {
  if (valor == null) return null;
  if (typeof valor !== 'string')
    throw new BusinessException(`El ${campo} no es válido`);
  const limpio = valor.trim();
  if (limpio.length > largo)
    throw new BusinessException(
      `El ${campo} no puede tener más de ${largo} caracteres`,
    );
  return limpio || null;
}

/** Valida y normaliza lo que llega del cliente; al actualizar la habitación no se valida porque no cambia */
export function validarAcceso(
  datos: AccesoRequest,
  nuevo: boolean,
): AccesoGuardar {
  const habitacion = nuevo
    ? texto(datos.haacHabitacion, 'número de habitación', 10)
    : '';
  if (nuevo && !habitacion)
    throw new BusinessException('La habitación es obligatoria');

  if (esTextoVacio(datos.haacClienteNombre))
    throw new BusinessException('El nombre del huésped es obligatorio');
  const nombre = texto(datos.haacClienteNombre, 'nombre del huésped', 100)!;
  const documento = texto(datos.haacClienteDoc, 'documento', 20);

  const inicio = fechaValida(datos.haacFechaInicio, 'fecha de inicio');
  const fin = fechaValida(datos.haacFechaFin, 'fecha de fin');
  if (fin <= inicio)
    throw new BusinessException(
      'La fecha de fin debe ser posterior a la de inicio',
    );

  return {
    haacId: (datos.haacId as number) ?? null,
    haacHabitacion: habitacion ?? '',
    haacClienteNombre: nombre,
    haacClienteDoc: documento,
    haacFechaInicio: inicio,
    haacFechaFin: fin,
  };
}
