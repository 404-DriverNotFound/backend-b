import { OmitType } from '@nestjs/swagger';
import { GetMatchesInfoFilterDto } from './get-matches-info-filter.dto';

export class GetSpectatingFilterDto extends OmitType(GetMatchesInfoFilterDto, [
  'status',
] as const) {}
