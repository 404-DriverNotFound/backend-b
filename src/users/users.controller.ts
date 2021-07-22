import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  //Delete,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserStatusDto } from './dto/update-user-status.dto';
import { User } from './user.entity';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  // NOTE 추 후에 auth/signup 부분으로 이동하는 것이 좋을 것 같아서 삭제할 예정.
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './files/avatar',
        filename: (req, file, cb) => {
          const fileName: string = req.body.name;
          const timeStamp = Date.now();
          const fileExt: string = file.mimetype.split('/')[1];
          cb(null, `${fileName}.${timeStamp}.${fileExt}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        const type: string = file.mimetype.split('/')[0];
        if (type !== 'image') {
          cb(new BadRequestException(`not a image file!`), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  @Post()
  @ApiOperation({
    summary:
      '유저를 생성합니다(테스트용으로 만들었고, 나중에 사용되지 않을 수 있음).',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    description: 'name and avatar',
    type: CreateUserDto,
  })
  @ApiResponse({ status: 201, description: '성공' })
  @ApiResponse({ status: 400, description: '입력 검증 실패' })
  @ApiResponse({ status: 409, description: '중복' })
  createUser(
    @Body() createUserDto: CreateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<User> {
    const avatar = file ? file.path : 'intra.png';
    return this.usersService.createUser(createUserDto, avatar);
  }

  //@Get()
  //findAll() {
  //  return this.usersService.findAll();
  //}

  @Get(':name')
  @ApiOperation({ summary: '유저 정보를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '유저 없음' })
  getUserByName(@Param('name') name: string): Promise<User> {
    return this.usersService.getUserByName(name);
  }

  @Patch(':name/status')
  @ApiOperation({ summary: '유저의 접속 상태를 변경합니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({
    status: 400,
    description: '유효하지 않은 접속상태를 입력했을 때',
  })
  @ApiResponse({ status: 404, description: '유저 없음' })
  updateUserStatus(
    @Param('name') name: string,
    @Body() updateUserStatusDto: UpdateUserStatusDto,
  ): Promise<User> {
    const { status } = updateUserStatusDto;
    return this.usersService.updateUserStatus(name, status);
  }

  //@Delete(':id')
  //remove(@Param('id') id: string) {
  //  return this.usersService.remove(+id);
  //}
}
