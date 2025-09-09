import { Controller, Post, Body, UseGuards, Request, Get, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserProfileResponseDto } from './dto/user-profile-response.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ 
    status: 201, 
    description: 'Utilisateur connecté avec succès',
    type: LoginResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Email ou mot de passe incorrect' })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return this.authService.login(user);
  }

  @Post('register')
  @ApiOperation({ summary: 'Inscription d\'un nouveau candidat' })
  @ApiResponse({ 
    status: 201, 
    description: 'Compte créé avec succès',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 409, description: 'Email déjà utilisé' })
  @ApiBody({ type: RegisterDto })
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiOperation({ summary: 'Récupérer le profil utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profil utilisateur récupéré',
    type: UserProfileResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }
}
