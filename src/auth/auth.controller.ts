import { Body, Controller, Get, Post, Req, UseGuards, UseInterceptors, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RegisterDto } from './dtos/register.dto';
import { LoginDto } from './dtos/login.dto';
import { JwtGuard } from './guards/jwt.guard';
import { TokenDto } from './dtos/refresh.dto';
import { AuthResponseInterceptor } from './interceptors/authresponse.interceptor';
import { Roles } from './decorators/roles.decorator';
import { RolesGuard } from './guards/roles.guard';
import { Role } from '@prisma/client';

@Controller('auth')
@UseInterceptors(AuthResponseInterceptor)
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('register')
  
  register(@Body() registerDTO: RegisterDto) {
    return this.authService.register(registerDTO);
  }

  @Post('login')
  // @UseGuards(LocalGuard)
  login(@Body() loginDTO: LoginDto) {
    return this.authService.validateUser(loginDTO);
  }

  @Post('refresh-token')
  refreshToken(@Body() tokenDTO: TokenDto) {
    return this.authService.refreshTokens(tokenDTO.refreshToken);
  }
}
