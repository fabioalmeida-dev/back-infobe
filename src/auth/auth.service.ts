import {BadRequestException, Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {JwtService} from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import {AuthResponseDto} from './dto/responses/admin-auth-response.dto';
import type {UserCreateRequestDto} from './dto/requests/user-create-request.dto';
import type {ChangePasswordDto} from './dto/requests/change-password.dto';
import {AUTH_REPOSITORY, type AuthRepository, type JwtPayload, type UserCreateOutput} from "./auth.interface";


@Injectable()
export class AuthService {
  constructor(
    @Inject(AUTH_REPOSITORY) private repository: AuthRepository,
    private readonly jwtService: JwtService,
  ) {}


  async authenticateByEmailAndPassword(
    email: string,
    password: string,
  ): Promise<any> {
    const user = await this.repository.findUser(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      throw new UnauthorizedException();
    }


    const jwt = this.jwtService.sign({ sub: String(user.id) } as JwtPayload);


    const response = new AuthResponseDto();
    response.accessToken = jwt;
    response.type = 'Bearer';
    response.role = user.role;


    return response;
  }



  async createUser(dto: UserCreateRequestDto): Promise<UserCreateOutput> {
   return await this.repository.createUser({
      name: dto.name,
      email: dto.email,
      password: dto.password,
      tax_identifier: dto.tax_identifier,
    });
  }

  async changePassword(userId: string, dto: ChangePasswordDto): Promise<void> {
    const user = await this.repository.findByEmail(dto.email);
    
    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.id !== userId) {
      throw new UnauthorizedException('You can only change your own password');
    }

    const isOldPasswordValid = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }
    
    await this.repository.updatePassword(userId, dto.newPassword);
  }

}
