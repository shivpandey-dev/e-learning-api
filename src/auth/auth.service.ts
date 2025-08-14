// auth.service.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { SignInUserDto } from './dto/signInUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { SignUpUserDto } from './dto/signUpUser.dto';
import { JwtUserPayload } from './interfaces/jwtUserPayload.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService, // ⬅ add this
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

    const payload: JwtUserPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    // DEBUG: which secret is used for signing?
    const signingSecret = this.config.get<string>('JWT_SECRET');
    console.log('[AuthService] JWT_SECRET (signing):', signingSecret);

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
