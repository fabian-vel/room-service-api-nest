import { Injectable } from '@nestjs/common';
import { BusinessException } from '../../../../shared/domain/exception/business.exception.js';
import type {
  MenuItem,
  MenuItemRequest,
} from '../../domain/model/menu-item.js';
import { MenuItemRepository } from '../../domain/port/menu-item.repository.js';

@Injectable()
export class MenuItemUseCase {
  constructor(private readonly menuItemRepository: MenuItemRepository) {}

  async consultarItemsPorCategoria(
    request: MenuItemRequest,
  ): Promise<MenuItem[]> {
    if (!Number.isInteger(request.mecaId))
      throw new BusinessException('El mecaId no pueden ser nulos');
    return this.menuItemRepository.consultaMenuItemsPorCategoria(
      request.mecaId!,
    );
  }
}
