import { Module } from '@nestjs/common';
import { FeedService } from './service/feed.service';
import { FeedController } from './controller/feed.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedPostEntity } from './models/post.entity';
import { AuthModule } from '../auth/auth.module';
import { IsCreatorGuard } from './guards/is-creator.guard';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([FeedPostEntity])],
  controllers: [FeedController],
  providers: [FeedService, IsCreatorGuard],
})
export class FeedModule {}
