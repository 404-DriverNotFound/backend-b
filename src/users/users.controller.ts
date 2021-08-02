import {
  Body,
  Controller,
  Get,
  Head,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiCookieAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { AuthenticatedGuard } from 'src/auth/guards/authenticated.guard';
import { FtGuard } from 'src/auth/guards/ft.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { GetUser } from './get-user.decorator';
import { User } from './user.entity';
import { UsersService } from './users.service';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCookieAuth()
  @ApiOperation({ summary: '모든 유저 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 403, description: '세션 인증 실패' })
  @Get()
  @UseGuards(AuthenticatedGuard)
  getUsers(): Promise<User[]> {
    return this.usersService.getUsers();
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '나의 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 403, description: '세션 인증 실패' })
  @Get('me')
  @UseGuards(AuthenticatedGuard)
  getUserByRequestUser(@GetUser() user: User): User {
    return user;
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: 'id로 유저 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 403, description: '세션 인증 실패' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  @Get(':uuid')
  @UseGuards(AuthenticatedGuard)
  getUserById(@Param('uuid', ParseUUIDPipe) uuid: string): Promise<User> {
    return this.usersService.getUserById(uuid);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '중복 닉네임을 확인합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 403, description: '세션 인증 실패' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  @Head('name/:name')
  @UseGuards(AuthenticatedGuard)
  getUserByName(@Param('name') name: string): Promise<User> {
    return this.usersService.getUserByName(name);
  }

  @ApiOperation({ summary: '유저를 생성합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '입력 값 검증 실패' })
  @ApiResponse({ status: 409, description: '데이터(닉네임) 중복' })
  @ApiResponse({ status: 500, description: '생성 실패' })
  @Post()
  @UseGuards(FtGuard)
  createUser(
    @GetUser() user: User,
    @Body() createUserDto: CreateUserDto,
  ): Promise<User> {
    return this.usersService.createUser(user, createUserDto);
  }

  @ApiCookieAuth()
  @ApiOperation({ summary: '나의 정보를 수정합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 400, description: '입력 값 검증 실패' })
  @ApiResponse({ status: 403, description: '세션 인증 실패' })
  @ApiResponse({ status: 409, description: '데이터(닉네임) 중복' })
  @ApiResponse({ status: 500, description: '업데이트 실패' })
  @Patch('me')
  @UseGuards(AuthenticatedGuard)
  updateUser(
    @GetUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.updateUser(user, updateUserDto);
  }
}
