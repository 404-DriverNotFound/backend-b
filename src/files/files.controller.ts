import { Controller, Get, Param, Res } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';

@ApiTags('Files')
@Controller('files')
export class FilesController {
  @Get('avatar/:path')
  @ApiOperation({ summary: '아바타 이미지를 가져옵니다.' })
  @ApiResponse({ status: 200, description: '성공' })
  @ApiResponse({ status: 404, description: '리소스 없음' })
  @ApiResponse({ status: 500, description: '실패' })
  getAvatar(@Param('path') path: string, @Res() res: Response): void {
    return res.sendFile(path, { root: 'files/avatar' });
  }
}
