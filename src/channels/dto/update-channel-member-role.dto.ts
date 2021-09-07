import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { MembershipRole } from '../membership-role.enum';

export class UpdateChannelMemberRoleDto {
  @ApiProperty({
    example: MembershipRole.ADMIN,
    required: true,
    enum: MembershipRole,
  })
  @IsNotEmpty()
  @IsEnum(MembershipRole)
  readonly role!: MembershipRole;
}
