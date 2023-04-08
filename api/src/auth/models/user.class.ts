import { FeedPost } from '../../feed/models/post.interface';
import { Role } from './role.enum';
import { IsEmail, IsString } from 'class-validator';

export class User {
  id?: number;
  firstName?: string;
  lastName?: string;
  @IsEmail()
  email?: string;
  @IsString()
  password?: string;
  role?: Role;
  image?: string;
  posts?: FeedPost[];
}
