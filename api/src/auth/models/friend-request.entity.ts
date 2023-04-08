import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { UserEntity } from './user.entity';
import { FriendRequest_Status } from './friend-request.interface';

@Entity('request')
export class FriendRequestEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  status: FriendRequest_Status;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.sentFriendRequest)
  creator: UserEntity;

  @ManyToOne(() => UserEntity, (userEntity) => userEntity.receivedFriendRequest)
  receiver: UserEntity;
}
