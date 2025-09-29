import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateExaminerDto } from './dto/create-examiner.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
  ) {}

  async createCandidate(createCandidateDto: CreateCandidateDto): Promise<UserResponseDto> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({ where: { email: createCandidateDto.email } });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Créer l'utilisateur avec le rôle 'candidate' par défaut
    const user = this.usersRepository.create({
      ...createCandidateDto,
      role: 'candidate',
      isActive: true,
      emailVerified: false,
      hasPaid: false,
      examTaken: false,
    });

    const savedUser = await this.usersRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  async createAdmin(createAdminDto: CreateAdminDto, currentUser: User): Promise<UserResponseDto> {
    // Vérifier que l'utilisateur actuel est un administrateur
    if (currentUser.role !== 'admin') {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des comptes administrateur');
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({ where: { email: createAdminDto.email } });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Créer l'administrateur
    const user = this.usersRepository.create({
      ...createAdminDto,
      role: 'admin',
      isActive: true,
      emailVerified: true, // Les administrateurs sont vérifiés automatiquement
    });

    const savedUser = await this.usersRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  async createExaminer(createExaminerDto: CreateExaminerDto, currentUser: User): Promise<UserResponseDto> {
    // Vérifier que l'utilisateur actuel est un administrateur
    if (currentUser.role !== 'admin') {
      throw new BadRequestException('Seuls les administrateurs peuvent créer des comptes examinateur');
    }

    // Vérifier si l'email existe déjà
    const existingUser = await this.usersRepository.findOne({ where: { email: createExaminerDto.email } });
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }

    // Créer l'examinateur
    const user = this.usersRepository.create({
      ...createExaminerDto,
      role: 'examiner',
      isActive: true,
      emailVerified: true, // Les examinateurs sont vérifiés automatiquement
    });

    const savedUser = await this.usersRepository.save(user);
    return new UserResponseDto(savedUser);
  }

  async findAll(role?: UserRole): Promise<UserResponseDto[]> {
    const where = role ? { role } : {};
    const users = await this.usersRepository.find({ where });
    return users.map(user => new UserResponseDto(user));
  }

  async findById(id: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }
    return new UserResponseDto(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async update(id: string, updateUserDto: UpdateUserDto, currentUser?: User): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Vérifier les autorisations
    if (currentUser && currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à modifier ce compte');
    }

    // Empêcher la modification du rôle sauf par un administrateur
    if (updateUserDto.role && (!currentUser || currentUser.role !== 'admin')) {
      throw new BadRequestException('Seuls les administrateurs peuvent modifier le rôle d\'un utilisateur');
    }

    // Mettre à jour l'utilisateur
    Object.assign(user, updateUserDto);
    const updatedUser = await this.usersRepository.save(user);
    return new UserResponseDto(updatedUser);
  }

  async remove(id: string, currentUser: User): Promise<void> {
    // Vérifier que l'utilisateur existe
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Utilisateur avec l'ID ${id} non trouvé`);
    }

    // Vérifier les autorisations
    if (currentUser.role !== 'admin' && currentUser.id !== id) {
      throw new BadRequestException('Vous n\'êtes pas autorisé à supprimer ce compte');
    }

    // Empêcher la suppression d'un administrateur par un non-administrateur
    if (user.role === 'admin' && currentUser.role !== 'admin') {
      throw new BadRequestException('Seuls les administrateurs peuvent supprimer un compte administrateur');
    }

    await this.usersRepository.remove(user);
  }

  // Méthodes spécifiques aux candidats
  async markExamTaken(userId: string): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId, role: 'candidate' } });
    if (!user) {
      throw new NotFoundException('Candidat non trouvé');
    }

    user.examTaken = true;
    user.examStartDate = new Date();
    const updatedUser = await this.usersRepository.save(user);
    return new UserResponseDto(updatedUser);
  }

  async updateExamScore(userId: string, score: number): Promise<UserResponseDto> {
    const user = await this.usersRepository.findOne({ where: { id: userId, role: 'candidate' } });
    if (!user) {
      throw new NotFoundException('Candidat non trouvé');
    }

    user.score = score;
    user.examTaken = true;
    const updatedUser = await this.usersRepository.save(user);
    return new UserResponseDto(updatedUser);
  }

  // Méthodes pour la vérification d'email
  async setEmailVerificationToken(userId: string, token: string): Promise<void> {
    const expires = new Date();
    expires.setHours(expires.getHours() + 24); // 24 heures d'expiration

    await this.usersRepository.update(userId, {
      verificationToken: token,
      verificationTokenExpires: expires,
    });
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: {
        verificationToken: token,
        verificationTokenExpires: { $gt: new Date() },
      },
    });

    if (!user) {
      return false;
    }

    user.emailVerified = true;
    user.verificationToken = null;
    user.verificationTokenExpires = null;
    await this.usersRepository.save(user);
    return true;
  }

  // Méthodes pour la réinitialisation du mot de passe
  async setPasswordResetToken(email: string, token: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({ where: { email } });
    if (!user) {
      return false;
    }

    const expires = new Date();
    expires.setHours(expires.getHours() + 1); // 1 heure d'expiration

    user.passwordResetToken = token;
    user.passwordResetExpires = expires;
    await this.usersRepository.save(user);
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { $gt: new Date() },
      },
    });

    if (!user) {
      return false;
    }

    user.password = newPassword;
    user.passwordResetToken = null;
    user.passwordResetExpires = null;
    await this.usersRepository.save(user);
    return true;
  }
}
