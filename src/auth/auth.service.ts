import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/signInUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { JwtUserPayload } from './interfaces/jwtUserPayload.interface';
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  // sign up
  async signUp(dto: SignUpUserDto) {
    const hashPassword = await bcrypt.hash(dto.password, 10);
    const user = this.userRepository.create({
      ...dto,
      password: hashPassword,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    await this.userRepository.save(user);

    return {
      id: user.id,
      fName: user.fName,
      lName: user.lName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    };
  }

  // sign In
  async signIn(dto: SignInUserDto) {
    const { identifier, password } = dto;

    const user = await this.userRepository.findOne({
      where: [{ email: identifier }, { phone: identifier }],
    });

    if (!user) throw new UnauthorizedException('Invalid Credential');

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) throw new UnauthorizedException('Invalid Credential');

    const payload: JwtUserPayload = { userId: user.id, role: user.role };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      accessToken,
      user: {
        id: user.id,
        fName: user.fName,
        lName: user.lName,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    };
  }
}
