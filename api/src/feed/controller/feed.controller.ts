import {
  Controller,
  Post,
  Body,
  Get,
  Put,
  Param,
  Delete,
  Query,
  UseGuards,
  Req,
} from '@nestjs/common';
import { FeedService } from '../service/feed.service';
import { FeedPost } from '../models/post.interface';
import { Observable } from 'rxjs';
import { DeleteResult, UpdateResult } from 'typeorm';
import { JwtGuard } from '../../auth/guards/jwt.guard';
// import { Roles } from '../../auth/decorator/roles.decorator';
// import { Role } from '../../auth/models/role.enum';
// import { RolesGuard } from '../../auth/guards/roles.guard';
// import { IsCreatorGuard } from '../guards/is-creator.guard';

@Controller('feed')
export class FeedController {
  constructor(private readonly feedService: FeedService) {}

  // @Get()
  // getAll(): Observable<FeedPost[]> {
  //   return this.feedService.findAllPosts()
  // }
  @Get()
  getSelected(
    @Query('take') take: number = 1,
    @Query('skip') skip: number = 1,
  ): Observable<FeedPost[]> {
    take = take > 20 ? 20 : take;
    return this.feedService.findPost(take, skip);
  }

  // @Roles(Role.ADMIN, Role.PREMIUM)
  // @UseGuards(JwtGuard, RolesGuard)
  @UseGuards(JwtGuard)
  @Post()
  create(@Body() post: FeedPost, @Req() req: any): Observable<FeedPost> {
    return this.feedService.createPost(post, req.user);
  }

  // @UseGuards(JwtGuard, IsCreatorGuard)
  @Put('put/:id')
  update(
    @Param('id') id: number,
    @Body() feedPost: FeedPost,
  ): Observable<UpdateResult> {
    return this.feedService.updatePost(id, feedPost);
  }

  // @UseGuards(JwtGuard, IsCreatorGuard)
  @Delete('delete/:id')
  delete(@Param('id') id: number): Observable<DeleteResult> {
    return this.feedService.deletePost(id);
  }
}
