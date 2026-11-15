import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import { TransactionManager } from '../../../../shared/domain/port/transaction-manager.js';
import { esTextoVacio } from '../../../../shared/util/validacion.util.js';
import type {
  MenuItem,
  MenuItemGuardar,
  MenuItemMaestro,
  MenuItemRequest,
} from '../../domain/model/menu-item.js';
import { MenuItemRepository } from '../../domain/port/menu-item.repository.js';

// límites de las columnas de tbl_menu_items
const MAX_NOMBRE = 100;
const MAX_IMAGEN_URL = 500;
const MAX_PRECIO = 99_999_999.99; // numeric(10,2)

@Injectable()
export class MenuItemUseCase {
  constructor(
    private readonly menuItemRepository: MenuItemRepository,
    private readonly transactionManager: TransactionManager,
  ) {}

  async consultarItemsPorCategoria(
    request: MenuItemRequest,
  ): Promise<MenuItem[]> {
    if (!Number.isInteger(request.mecaId))
      throw new BusinessException('El mecaId no pueden ser nulos');
    return this.menuItemRepository.consultaMenuItemsPorCategoria(
      request.mecaId!,
    );
  }

  consultarItems(): Promise<MenuItemMaestro[]> {
    return this.menuItemRepository.consultarItems();
  }

  async insertarItem(datos: Partial<MenuItemGuardar>): Promise<number> {
    const item = validarItem(datos);
    // el ítem y sus etiquetas se guardan juntos o no se guarda nada
    return this.transactionManager.ejecutar(async () => {
      const meitId = await this.menuItemRepository.insertarItem(item);
      if (meitId == null)
        throw new BusinessException(
          'La categoría no es una subcategoría activa',
        );
      await this.menuItemRepository.reemplazarEtiquetas(meitId, item.etiqIds);
      return meitId;
    });
  }

  async actualizarItem(datos: Partial<MenuItemGuardar>): Promise<number> {
    if (!Number.isInteger(datos.meitId))
      throw new BusinessException('El id del ítem es obligatorio');
    const item = validarItem(datos);
    return this.transactionManager.ejecutar(async () => {
      const filas = await this.menuItemRepository.actualizarItem(item);
      if (filas === 0)
        throw new BusinessException(
          'Ítem no encontrado o la categoría no es una subcategoría activa',
        );
      await this.menuItemRepository.reemplazarEtiquetas(
        item.meitId!,
        item.etiqIds,
      );
      return filas;
    });
  }

  async eliminarItem(meitId: number): Promise<number> {
    const filas = await this.menuItemRepository.eliminarItem(meitId);
    if (filas === 0) throw new BusinessException('Ítem no encontrado');
    return filas;
  }
}

/** Valida y normaliza lo que llega del cliente (textos sin espacios, vacíos a null) */
export function validarItem(datos: Partial<MenuItemGuardar>): MenuItemGuardar {
  const nombre = datos.meitNombre;
  if (esTextoVacio(nombre))
    throw new BusinessException('El nombre del ítem es obligatorio');
  if (nombre!.trim().length > MAX_NOMBRE)
    throw new BusinessException(
      `El nombre no puede tener más de ${MAX_NOMBRE} caracteres`,
    );

  const precio = datos.meitPrecio;
  if (typeof precio !== 'number' || !(precio > 0) || precio > MAX_PRECIO)
    throw new BusinessException('El precio debe ser un número mayor a 0');

  if (!Number.isInteger(datos.mecaId))
    throw new BusinessException('La categoría del ítem es obligatoria');

  const imagenUrl = textoOpcional(datos.meitImagenUrl);
  if (imagenUrl && imagenUrl.length > MAX_IMAGEN_URL)
    throw new BusinessException(
      `La URL de la imagen no puede tener más de ${MAX_IMAGEN_URL} caracteres`,
    );

  const etiqIds = datos.etiqIds ?? [];
  if (!Array.isArray(etiqIds) || !etiqIds.every(Number.isInteger))
    throw new BusinessException('Las etiquetas deben ser una lista de ids');

  return {
    meitId: datos.meitId ?? null,
    meitNombre: nombre!.trim(),
    meitDescripcion: textoOpcional(datos.meitDescripcion),
    meitPrecio: precio,
    meitImagenUrl: imagenUrl,
    mecaId: datos.mecaId!,
    etiqIds: [...new Set(etiqIds)],
  };
}

function textoOpcional(valor: unknown): string | null {
  return esTextoVacio(valor) ? null : (valor as string).trim();
}
