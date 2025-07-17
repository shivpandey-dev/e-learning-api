import { Body, Controller, Post } from '@nestjs/common';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { AuthService } from './auth.service';
import { SignInUserDto } from './dto/signInUser.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}
  @Post('sign-in')
  signIn(@Body() dto: SignInUserDto) {
    return this.authService.signIn(dto);
  }

  @Post('sign-up')
  signUp(@Body() dto: SignUpUserDto) {
    return this.authService.signUp(dto);
  }
}
