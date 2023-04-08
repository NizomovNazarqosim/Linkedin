import {
  Body,
  Controller,
  Post,
  Req,
  UseInterceptors,
  UseGuards,
  UploadedFile,
  Get,
  Res,
  Param,
  Put,
} from '@nestjs/common';
import { UserService } from '../services/user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { verifyToken } from '../helpers/jwt-verify';
import { JwtGuard } from '../guards/jwt.guard';
import { Observable, of } from 'rxjs';
import { User } from '../models/user.class';
import {
  FriendRequest,
  FriendRequestStatus,
} from '../models/friend-request.interface';

interface IVerifyedToken {
  user: {
    id: number;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
  iat: number;
  exp: number;
}
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('image')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './images',
        filename: (req, file, callback) => {
          const uniqueSuffix =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.originalname}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  )
  async handleUpload(
    @UploadedFile() file: Express.Multer.File,
    @Req() req,
    @Res() res,
  ) {
    const { filename } = file;
    const token = req.headers.token;
    const verifyed = await verifyToken(token, res);
    const userData = JSON.parse(JSON.stringify(verifyed)).user;

    const IsUser = this.userService.findUserById(userData.id);
    if (!IsUser) return 'You are not registered yet';
    console.log(userData.id);
    if (!filename) return 'Something went wrong';
    this.userService.updateUserImageById(userData.id, filename);
    res.send('File uploaded API');
  }

  @Get('image')
  async getUserImage(@Req() req, @Res() res) {
    const token = req.headers.token;
    if (!token) return res.send('You do not have token');
    const verifyed = await verifyToken(token, res);
    const userData = JSON.parse(JSON.stringify(verifyed)).user;

    const IsUser = this.userService.findUserById(Number(userData.id));
    if (!IsUser) return res.send('You are not registered yet');
    console.log(IsUser);
    res.send(userData.image);
  }

  @UseGuards(JwtGuard)
  @Get(':userId')
  findUserById(
    @Param('userId') userStringId: string,
  ): Observable<User | string> {
    const userId = parseInt(userStringId);
    return this.userService.findUserById(userId);
  }

  @UseGuards(JwtGuard)
  @Post('frined-request/send/:recieverId')
  sendConnectionRequest(
    @Param('recieverId') recieverStringId: string,
    @Req() req,
  ): Observable<FriendRequest | { error: string }> {
    const recieverId = parseInt(recieverStringId);
    // req.user = {
    //     id: 1,
    //     firstName: 'Eshmat',
    //     lastName: 'Eshmatov',
    //     email: 'eshmat@gmail.com',
    //     role: 'user'
    //   }
    return this.userService.sendFriendRequest(recieverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Get('frined-request/status/:recieverId')
  getFreindRequestStatus(
    @Param('recieverId') recieverStringId: string,
    @Req() req,
  ): Observable<FriendRequestStatus> {
    const receiverId = parseInt(recieverStringId);
    return this.userService.getFriendRequestStatus(receiverId, req.user);
  }

  @UseGuards(JwtGuard)
  @Put('frined-request/response/:friendRequestId')
  respondToFriendRequest(
    @Param('friendRequestId') friendRequestStringId: string,
    @Req() req,
    @Body() statusResponse: FriendRequestStatus,
  ): Observable<FriendRequestStatus> {
    const friendRequestId = parseInt(friendRequestStringId);
    console.log(friendRequestId, statusResponse);
    return this.userService.respondToFriendRequest(
      statusResponse.status,
      friendRequestId,
    );
  }

  @UseGuards(JwtGuard)
  @Get('frined-request/me/recieved-requests')
  getFriendRequestsFromRecipients(
    @Req() req,
  ): Observable<FriendRequestStatus[]> {
    return this.userService.getFriendRequestsFromRecipients(req.user);
  }
}
