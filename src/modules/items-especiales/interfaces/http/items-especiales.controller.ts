import { Controller, Get } from '@nestjs/common';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { ItemsEspecialesUseCase } from '../../application/usecase/items-especiales.use-case.js';
import { ItemsEspecialesDocs } from './items-especiales.docs.js';

@ItemsEspecialesDocs.controller()
@Controller('items-especiales')
export class ItemsEspecialesController {
  constructor(
    private readonly itemsEspecialesUseCase: ItemsEspecialesUseCase,
  ) {}

  @Get()
  @ItemsEspecialesDocs.consultar()
  async consultarItemsEspeciales() {
    return ApiResponse.ok(
      '',
      await this.itemsEspecialesUseCase.consultarItemsEspeciales(),
      1,
    );
  }
}
