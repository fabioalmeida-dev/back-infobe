import {Body, Controller, HttpException, HttpStatus, Post, Res,} from '@nestjs/common';
import {AuthService} from './auth.service';
import {Public} from './public.decorator';
import {UserCreateRequestDto} from './dto/requests/user-create-request.dto';
import {ChangePasswordDto} from './dto/requests/change-password.dto';
import {UserError} from './errors/user.error';
import {User} from '../decorators/user.decorator';
import type {Response} from "express";

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  async login(
    @Body() loginDto: { email: string; password: string },
    @Res() res: Response,
  ) {
    try {
      const user = await this.authService.authenticateByEmailAndPassword(
        loginDto.email,
        loginDto.password,
      );
      return res.status(HttpStatus.OK).json(user);
    } catch (error) {
      console.log(error);
      return res.status(HttpStatus.UNAUTHORIZED).json({
        message: 'Unauthorized, please contact administrator.',
      });
    }
  }



  @Public()
  @Post('signup')
  async createUser(@Body() body: UserCreateRequestDto, @Res() res: Response) {
    try {
      await this.authService.createUser(body);
      return res.status(HttpStatus.CREATED).json({
        message: 'User created successfully',
      });
    } catch (error) {
      if (error instanceof UserError) {
        throw new HttpException(error.message, HttpStatus.BAD_REQUEST, {
          cause: error,
        });
      }

      throw error;
    }
  }

  @Post('change-password')
  async changePassword(
    @User('id') userId: string,
    @Body() dto: ChangePasswordDto,
    @Res() res: Response,
  ) {
    try {
      await this.authService.changePassword(userId, dto);
      return res.status(HttpStatus.OK).json({
        message: 'Password changed successfully',
      });
    } catch (error) {
      if (error instanceof HttpException) {
        return res.status(error.getStatus()).json({
          message: error.message,
        });
      }
      
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal server error',
      });
    }
  }
}