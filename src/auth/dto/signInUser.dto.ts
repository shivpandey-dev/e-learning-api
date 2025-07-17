import { IsString, MinLength } from 'class-validator';

export class SignInUserDto {
  @IsString()
  identifier: string;

  @IsString()
  @MinLength(6)
  password: string;
}
