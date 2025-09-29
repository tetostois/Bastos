import { 
  Controller, 
  Post, 
  Body, 
  UseGuards, 
  Request, 
  Get, 
  UnauthorizedException, 
  BadRequestException,
  HttpStatus,
  Res,
  Query
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiBearerAuth } from '@nestjs/swagger';
import { LoginResponseDto } from './dto/login-response.dto';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CreateCandidateDto } from '../users/dto/create-candidate.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { CreateExaminerDto } from '../users/dto/create-examiner.dto';
// Les DTOs sont maintenant directement dans le même répertoire
import { ResetPasswordDto } from './reset-password.dto';
import { RequestPasswordResetDto } from './request-password-reset.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Connexion utilisateur' })
  @ApiResponse({ 
    status: 200, 
    description: 'Utilisateur connecté avec succès',
    type: LoginResponseDto,
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Email ou mot de passe incorrect ou compte non vérifié' 
  })
  @ApiBody({ type: LoginDto })
  async login(@Body() loginDto: LoginDto) {
    const user = await this.authService.validateUser(loginDto.email, loginDto.password);
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }
    return this.authService.login(user);
  }

  @Post('register/candidate')
  @ApiOperation({ summary: 'Inscription d\'un nouveau candidat' })
  @ApiResponse({ 
    status: 201, 
    description: 'Compte candidat créé avec succès. Un email de vérification a été envoyé.',
    type: UserResponseDto,
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email déjà utilisé' 
  })
  @ApiBody({ type: CreateCandidateDto })
  async registerCandidate(@Body() registerDto: CreateCandidateDto) {
    return this.authService.register(registerDto);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('register/admin')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouvel administrateur (réservé aux administrateurs)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Compte administrateur créé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Accès refusé. Réservé aux administrateurs.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email déjà utilisé' 
  })
  @ApiBody({ type: CreateAdminDto })
  async registerAdmin(@Request() req, @Body() createAdminDto: CreateAdminDto) {
    // Le middleware JWT vérifie déjà que l'utilisateur est authentifié
    // Vérification supplémentaire du rôle administrateur
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Accès refusé. Réservé aux administrateurs.');
    }
    
    return this.authService.createAdmin(createAdminDto, req.user);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('register/examiner')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Créer un nouvel examinateur (réservé aux administrateurs)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Compte examinateur créé avec succès',
    type: UserResponseDto,
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Accès refusé. Réservé aux administrateurs.' 
  })
  @ApiResponse({ 
    status: 409, 
    description: 'Email déjà utilisé' 
  })
  @ApiBody({ type: CreateExaminerDto })
  async registerExaminer(@Request() req, @Body() createExaminerDto: CreateExaminerDto) {
    // Vérification du rôle administrateur
    if (req.user.role !== 'admin') {
      throw new UnauthorizedException('Accès refusé. Réservé aux administrateurs.');
    }
    
    return this.authService.createExaminer(createExaminerDto, req.user);
  }

  @Get('verify-email')
  @ApiOperation({ summary: 'Vérifier l\'adresse email avec un token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Email vérifié avec succès ou lien invalide/expiré',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  async verifyEmail(@Query('token') token: string) {
    if (!token) {
      throw new BadRequestException('Token de vérification manquant');
    }
    
    return this.authService.verifyEmail(token);
  }

  @Post('request-password-reset')
  @ApiOperation({ summary: 'Demander une réinitialisation de mot de passe' })
  @ApiResponse({ 
    status: 200, 
    description: 'Si l\'email existe, un lien de réinitialisation a été envoyé',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiBody({ type: RequestPasswordResetDto })
  async requestPasswordReset(@Body() requestPasswordResetDto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(requestPasswordResetDto.email);
  }

  @Post('reset-password')
  @ApiOperation({ summary: 'Réinitialiser le mot de passe avec un token' })
  @ApiResponse({ 
    status: 200, 
    description: 'Mot de passe réinitialisé avec succès ou lien invalide/expiré',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean' },
        message: { type: 'string' }
      }
    }
  })
  @ApiBody({ type: ResetPasswordDto })
  async resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(
      resetPasswordDto.token,
      resetPasswordDto.newPassword
    );
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @ApiResponse({ 
    status: 200, 
    description: 'Profil utilisateur récupéré',
    type: UserResponseDto,
  })
  @ApiResponse({ status: 401, description: 'Non autorisé' })
  @ApiBearerAuth('JWT-auth')
  getProfile(@Request() req) {
    return this.authService.getUserProfile(req.user.id);
  }
}
