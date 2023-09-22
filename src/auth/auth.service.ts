import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { LoginUserDto } from './dto/login-user.dto';
import { JwtService } from '@nestjs/jwt';
import { JwtPayload } from './interfaces/jwt-payload.interface';

@Injectable()
export class AuthService {
  [x: string]: any;
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}
  async create(createUserDto: CreateUserDto) {
    try {
      const { password, ...userData } = createUserDto;
      const user = this.userRepository.create({
        ...userData,
        password: bcrypt.hashSync(password, 10),
      });

      await this.userRepository.save(user);

      delete user.password;
      return user;
    } catch (error) {
      this.handleExceptions(error);
    }
  }

  async login(loginUserDto: LoginUserDto) {
    const { password, email } = loginUserDto;
    const user = await this.userRepository.findOne({
      where: { email },
      select: { email: true, password: true, id: true, fullName: true },
    });
    if (!user) throw new UnauthorizedException(`Credentials are not valid`);
    if (!bcrypt.compareSync(password, user.password))
      throw new UnauthorizedException(`Credentials are not valid`);
    return {
      ...user,
      token: this.getJWTToken({ id: user.id, fullName: user.fullName }),
    };
  }

  private getJWTToken(payload: JwtPayload) {
    return this.jwtService.sign(payload);
  }

  private handleExceptions(error: any) {
    if (error.code === '23505')
      throw new BadRequestException('Ya se encuentra registrado el email');
    this.logger.error(error);
    throw new InternalServerErrorException(
      'Unexpected error, check server logs.',
    );
  }
}
