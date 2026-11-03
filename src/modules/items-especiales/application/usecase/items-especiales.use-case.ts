import { Injectable } from '@nestjs/common';
import { getConstanteNumero } from '../../../../shared/util/constante.util.js';
import { ConstantesRepository } from '../../../constantes/domain/port/constantes.repository.js';
import type {
  ItemEspecial,
  ItemsEspeciales,
} from '../../domain/model/items-especiales.js';
import { ItemsEspecialesRepository } from '../../domain/port/items-especiales.repository.js';

const CANTIDAD = 5;
const CONST_ETIQ_RECOM_CHEF = 'CONST_ETIQ_RECOM_CHEF';

@Injectable()
export class ItemsEspecialesUseCase {
  constructor(
    private readonly itemsEspecialesRepository: ItemsEspecialesRepository,
    private readonly constantesRepository: ConstantesRepository,
  ) {}

  async consultarItemsEspeciales(): Promise<ItemsEspeciales> {
    // las tres consultas en paralelo, como el Mono.zip de Java
    const [itemsMasPedidos, itemsMasRecientes, itemsRecomendadosChef] =
      await Promise.all([
        this.itemsEspecialesRepository.consultarItemsMasPedidos(CANTIDAD),
        this.itemsEspecialesRepository.consultarItemsMasRecientes(CANTIDAD),
        this.consultarItemRecomendado(),
      ]);
    return { itemsMasPedidos, itemsMasRecientes, itemsRecomendadosChef };
  }

  private async consultarItemRecomendado(): Promise<ItemEspecial[]> {
    const constantes = await this.constantesRepository.consultaConstantes([
      CONST_ETIQ_RECOM_CHEF,
    ]);
    const etiqueta = getConstanteNumero(constantes, CONST_ETIQ_RECOM_CHEF);
    return this.itemsEspecialesRepository.consultarItemsRecomendadosChef(
      CANTIDAD,
      etiqueta,
    );
  }
}
