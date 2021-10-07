import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';
import { v4 as uuid } from 'uuid';

export const localOptions: MulterOptions = {
  storage: diskStorage({
    destination: './files/avatar',
    filename: (_req, file, cb) => {
      const timeStamp = Date.now();
      const fileExt: string = file.mimetype.split('/')[1];
      return cb(null, `${uuid()}.${timeStamp}.${fileExt}`);
    },
  }),
  fileFilter: (_req, file, cb) => {
    const type: string = file.mimetype.split('/')[0];
    if (type !== 'image') {
      return cb(new BadRequestException([`not a image file!`]), false);
    }
    return cb(null, true);
  },
};
