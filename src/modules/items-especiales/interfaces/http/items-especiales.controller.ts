import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ApiResponse } from '../../../../shared/response/api-response.js';
import { ItemsEspecialesUseCase } from '../../application/usecase/items-especiales.use-case.js';

@ApiTags('Menú')
@Controller('items-especiales')
export class ItemsEspecialesController {
  constructor(
    private readonly itemsEspecialesUseCase: ItemsEspecialesUseCase,
  ) {}

  @Get()
  async consultarItemsEspeciales() {
    // mensaje vacío y size 1, como en el API Java
    return ApiResponse.ok(
      '',
      await this.itemsEspecialesUseCase.consultarItemsEspeciales(),
      1,
    );
  }
}
