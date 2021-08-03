import { BadRequestException } from '@nestjs/common';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import { diskStorage } from 'multer';

export const localOptions: MulterOptions = {
  storage: diskStorage({
    destination: './files/avatar',
    filename: (req, file, cb) => {
      console.log(req, file, cb);
      const fileName: string = req.body.name;
      const timeStamp = Date.now();
      const fileExt: string = file.mimetype.split('/')[1];
      return cb(null, `${fileName}.${timeStamp}.${fileExt}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    const type: string = file.mimetype.split('/')[0];
    if (type !== 'image') {
      return cb(new BadRequestException(`not a image file!`), false);
    }
    return cb(null, true);
  },
};
