import { IsString, IsOptional } from 'class-validator';

export class CreateUserDto {
  @IsString()
  readonly name: string;

  @IsOptional()
  @IsString()
  readonly avatar?: string;
}
