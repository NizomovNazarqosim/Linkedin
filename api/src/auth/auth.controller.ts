import { Controller, Post, Body } from '@nestjs/common';
import { AuthService } from './auth.service';
import { User } from './models/user.class';
import { Observable, from, map } from 'rxjs';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() user: User): Observable<User> {
    return from(this.authService.registerAccount(user));
  }

  @Post('login')
  login(@Body() user: User): Observable<{ token: string }> {
    return this.authService
      .login(user)
      .pipe(map((jwt: string) => ({ token: jwt })));
  }
}
