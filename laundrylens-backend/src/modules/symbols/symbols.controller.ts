import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SymbolsService } from './symbols.service';

@ApiTags('symbols')
@Controller('symbols')
export class SymbolsController {
  constructor(private readonly symbolsService: SymbolsService) {}
}
