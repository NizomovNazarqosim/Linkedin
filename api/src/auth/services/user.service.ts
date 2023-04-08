import { Injectable } from '@nestjs/common';
import { Observable, from, map, of, switchMap } from 'rxjs';
import { User } from '../models/user.class';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../models/user.entity';
import { Repository, UpdateResult } from 'typeorm';
import {
  FriendRequest,
  FriendRequestStatus,
  FriendRequest_Status,
} from '../models/friend-request.interface';
import { FriendRequestEntity } from '../models/friend-request.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(FriendRequestEntity)
    private readonly friendRequestRepository: Repository<FriendRequestEntity>,
  ) {}

  findUserById(id: number): Observable<User | string> {
    return from(
      this.userRepository.findOne({
        where: {
          id: id,
        },
        relations: {
          feedPosts: true,
        },
      }),
    ).pipe(
      map((user: User) => {
        if (!user) return 'User not found';
        delete user.password;
        return user;
      }),
    );
  }
  updateUserImageById(id: number, imagePath: string): Observable<UpdateResult> {
    const user: User = new UserEntity();
    user.id = id;
    user.image = imagePath;
    return from(this.userRepository.update(id, user));
  }
  findImageNameByUserId(id: number): Observable<string> {
    return from(this.userRepository.findOne({ where: { id } })).pipe(
      map((user: User) => {
        delete user.password;
        return user.image;
      }),
    );
  }
  hasRequestBeenSentOrRecieved(creator: User, receiver): Observable<boolean> {
    return from(
      this.friendRequestRepository.findOne({
        where: [
          { creator: receiver },
          { creator: receiver, receiver: creator },
        ],
      }),
    ).pipe(
      switchMap((friendRequest: FriendRequest) => {
        if (!friendRequest) return of(false);
        return of(true);
      }),
    );
  }
  sendFriendRequest(
    recieverId: number,
    creator: User,
  ): Observable<FriendRequest | { error: string }> {
    if (recieverId == creator.id)
      return of({ error: 'It is not possible to add yourself' });
    return this.findUserById(recieverId).pipe(
      switchMap((receiver: User) => {
        return this.hasRequestBeenSentOrRecieved(creator, receiver).pipe(
          switchMap((hasRequestBeenSentOrRecieved: boolean) => {
            if (hasRequestBeenSentOrRecieved)
              return of({
                error:
                  'A friend request has already been sent of recieved of your account',
              });
            let friendRequest: FriendRequest = {
              creator,
              receiver,
              status: 'pending',
            };
            return from(this.friendRequestRepository.save(friendRequest));
          }),
        );
      }),
    );
  }

  getFriendRequestStatus(
    receiverId: number,
    currentUser: User,
  ): Observable<FriendRequestStatus> {
    return this.findUserById(receiverId).pipe(
      switchMap((receiver: User) => {
        if (!receiver)
          return of({
            status: 'User topilmadi' as FriendRequest_Status,
          });
        return from(
          this.friendRequestRepository.findOne({
            where: [
              { creator: currentUser, receiver: receiver },
              { creator: receiver, receiver: currentUser },
            ],
            relations: ['creator', 'receiver'],
          }),
        );
      }),
      switchMap((friendRequest: FriendRequest) => {
        if (friendRequest?.receiver == currentUser.id) {
          return of({
            status: 'waitingg' as FriendRequest_Status,
          });
        }
        console.log(friendRequest, 'frRequest');
        return of({ status: friendRequest?.status });
      }),
    );
  }
  getFriendRequestUserById(friendRequestId: number): Observable<FriendRequest> {
    return from(
      this.friendRequestRepository.findOne({
        where: [{ id: friendRequestId }],
      }),
    );
  }

  respondToFriendRequest(
    statusResponse: FriendRequest_Status,
    friendRequestId: number,
  ): Observable<FriendRequestStatus> {
    return this.getFriendRequestUserById(friendRequestId).pipe(
      switchMap((friendRequest: FriendRequest) => {
        return from(
          this.friendRequestRepository.save({
            ...friendRequest,
            status: statusResponse,
          }),
        );
      }),
    );
  }

  getFriendRequestsFromRecipients(
    currentUser: User,
  ): Observable<FriendRequest[]> {
    return from(
      this.friendRequestRepository.find({
        where: [{ receiver: currentUser }],
      }),
    );
  }
}
