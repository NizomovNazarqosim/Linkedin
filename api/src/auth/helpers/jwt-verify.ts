import { Response } from 'express';
import * as jwt from 'jsonwebtoken';

export const verifyToken = async (
  token: string,
  res: Response,
): Promise<any> => {
  try {
    const verifyed = await jwt.verify(
      token,
      'jwtsecret',
      function (err, decode) {
        if (err) return res.send(err);
        return decode;
      },
    );
    return verifyed;
  } catch (error) {
    res.send(error);
  }
};
