import { diskStorage } from 'multer';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
// const fileType = require('file-type')
import * as fileType from 'file-type';
import path = require('path');
import { Observable, from, switchMap, of } from 'rxjs';

type validFileExtention = 'png' | 'jpg' | 'jpeg';
type validMimeType = 'image/png' | 'image/jpg' | 'image/jpeg';

const validFileExtentions: validFileExtention[] = ['png', 'jpg', 'jpeg'];
const validMimeTypes: validMimeType[] = [
  'image/png',
  'image/jpg',
  'image/jpeg',
];

export const saveImageToStarage = {
  storage: diskStorage({
    destination: './images',
    filename: (req, file, cb) => {
      const fileExtention: string = path.extname(file.originalname);
      const fileName: string = uuidv4() + fileExtention;

      cb(null, fileName);
    },
  }),
  fileFilter: (req, file, cb) => {
    const allowedMimeTypes: validMimeType[] = validMimeTypes;
    allowedMimeTypes.includes(file.mimetype) ? cb(null, true) : cb(null, false);
  },
};
export const isFileExtensionSafe = (
  fullFilePath: string,
): Observable<unknown | any> => {
  return from(fileType.fileTypeFromFile(fullFilePath)).pipe(
    switchMap(
      (
        fileExtensionAndMimeType:
          | {
              ext: validFileExtention;
              mime: validMimeType;
            }
          | any,
      ) => {
        if (!fileExtensionAndMimeType) return of(false);

        const isFileTypeLegit = validFileExtentions.includes(
          fileExtensionAndMimeType.ext,
        );
        const isMimeTypeLegit = validMimeTypes.includes(
          fileExtensionAndMimeType.mime,
        );
        const isFileLegit = isFileTypeLegit && isMimeTypeLegit;
        return of(isFileLegit);
      },
    ),
  );
};
export const removeFile = (fullFilePath: string): void => {
  try {
    fs.unlinkSync(fullFilePath);
  } catch (error) {
    console.log(error);
  }
};
