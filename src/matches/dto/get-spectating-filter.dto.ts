import { OmitType } from '@nestjs/swagger';
import { GetMatchesFilterDto } from './get-matches-filter.dto';

export class GetSpectatingFilterDto extends OmitType(GetMatchesFilterDto, [
  'status',
] as const) {}
