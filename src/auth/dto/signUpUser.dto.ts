import { IsEmail, IsMobilePhone, IsString, MinLength } from 'class-validator';

export class SignUpUserDto {
  @IsString()
  fName: string;

  @IsString()
  lName: string;

  @IsEmail()
  email: string;

  @IsMobilePhone()
  phone: string;

  @MinLength(6)
  password: string;
}
