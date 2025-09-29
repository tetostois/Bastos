import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { RegisterDto } from './dto/register.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { UserResponseDto } from '../users/dto/user-response.dto';
import { CreateCandidateDto } from '../users/dto/create-candidate.dto';
import { CreateAdminDto } from '../users/dto/create-admin.dto';
import { CreateExaminerDto } from '../users/dto/create-examiner.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<User | null> {
    const user = await this.usersService.findByEmail(email);
    
    // Vérifier si l'utilisateur existe et est actif
    if (!user || !user.isActive) {
      return null;
    }

    // Vérifier le mot de passe
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return null;
    }

    // Vérifier si l'email est vérifié (sauf pour les administrateurs et les examinateurs)
    if (user.role === 'candidate' && !user.emailVerified) {
      throw new UnauthorizedException('Veuillez vérifier votre adresse email avant de vous connecter');
    }

    return user;
  }

  async login(user: User) {
    const payload = { 
      sub: user.id,
      email: user.email, 
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName
    };

    // Créer le token JWT
    const accessToken = this.jwtService.sign(payload);

    // Retourner les informations de l'utilisateur (sans le mot de passe)
    const userResponse = new UserResponseDto(user);

    return {
      access_token: accessToken,
      user: userResponse
    };
  }

  async createAdmin(createAdminDto: CreateAdminDto, currentUser: User): Promise<UserResponseDto> {
    // Vérifier que l'utilisateur actuel est un administrateur
    if (currentUser.role !== 'admin') {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des comptes administrateur');
    }

    // Créer l'administrateur via le service utilisateur
    const user = await this.usersService.createAdmin(createAdminDto, currentUser);
    return user;
  }

  async createExaminer(createExaminerDto: CreateExaminerDto, currentUser: User): Promise<UserResponseDto> {
    // Vérifier que l'utilisateur actuel est un administrateur
    if (currentUser.role !== 'admin') {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des comptes examinateur');
    }

    // Créer l'examinateur via le service utilisateur
    const user = await this.usersService.createExaminer(createExaminerDto, currentUser);
    return user;
  }

  async register(registerDto: CreateCandidateDto): Promise<{ message: string; user: UserResponseDto }> {
    try {
      // Créer le candidat via le service utilisateur
      const user = await this.usersService.createCandidate(registerDto);
      
      // Générer un token de vérification d'email
      const emailVerificationToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '1d' },
      );

      // Enregistrer le token de vérification
      await this.usersService.setEmailVerificationToken(user.id, emailVerificationToken);

      // TODO: Envoyer un email de vérification
      console.log('Email verification token:', emailVerificationToken);

      return {
        message: 'Inscription réussie. Veuillez vérifier votre email pour activer votre compte.',
        user: new UserResponseDto(user),
      };
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Une erreur est survenue lors de l\'inscription');
    }
  }

  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier le token avec le service utilisateur
      const isVerified = await this.usersService.verifyEmail(token);
      
      if (!isVerified) {
        return { success: false, message: 'Lien de vérification invalide ou expiré' };
      }
      
      return { success: true, message: 'Email vérifié avec succès' };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la vérification de l\'email');
    }
  }

  async requestPasswordReset(email: string): Promise<{ success: boolean; message: string }> {
    try {
      const user = await this.usersService.findByEmail(email);
      
      // Ne pas révéler si l'email n'existe pas
      if (!user) {
        return {
          success: true,
          message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'
        };
      }

      // Générer un token de réinitialisation
      const resetToken = this.jwtService.sign(
        { sub: user.id },
        { expiresIn: '1h' },
      );

      // Enregistrer le token de réinitialisation
      await this.usersService.setPasswordResetToken(user.email, resetToken);

      // TODO: Envoyer un email avec le lien de réinitialisation
      console.log('Password reset token:', resetToken);

      return {
        success: true,
        message: 'Si un compte avec cet email existe, un lien de réinitialisation a été envoyé.'
      };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la demande de réinitialisation du mot de passe');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<{ success: boolean; message: string }> {
    try {
      // Vérifier et réinitialiser le mot de passe via le service utilisateur
      const isReset = await this.usersService.resetPassword(token, newPassword);
      
      if (!isReset) {
        return { success: false, message: 'Lien de réinitialisation invalide ou expiré' };
      }
      
      return { success: true, message: 'Mot de passe réinitialisé avec succès' };
    } catch (error) {
      throw new BadRequestException('Erreur lors de la réinitialisation du mot de passe');
    }
  }

  async getUserProfile(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('Utilisateur non trouvé');
    }
    const { password, ...result } = user;
    return result;
  }
}
