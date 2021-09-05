import { OmitType } from '@nestjs/swagger';
import { PaginationFilterDto } from 'src/channels/dto/pagination-filter.dto';

export class GetDMersFilterDto extends OmitType(PaginationFilterDto, [
  'search',
] as const) {}
