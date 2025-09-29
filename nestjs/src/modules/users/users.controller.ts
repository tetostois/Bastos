import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  UseGuards, 
  Request, 
  UsePipes, 
  ValidationPipe,
  ForbiddenException,
  ConflictException,
  Query,
  ParseUUIDPipe,
  NotFoundException
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody, 
  ApiParam,
  ApiQuery,
  ApiOkResponse
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateExaminerDto } from './dto/create-examiner.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { RolesGuard } from '../../common/guards/roles.guard';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard('jwt'), RolesGuard)
@UsePipes(new ValidationPipe({ transform: true }))
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @Roles('admin')
  @ApiOperation({ summary: 'Créer un nouvel utilisateur (Admin uniquement)' })
  @ApiResponse({ status: 201, description: 'Utilisateur créé avec succès', type: User })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiBody({ type: CreateUserDto })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await this.usersService.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Un utilisateur avec cet email existe déjà');
    }
    return this.usersService.create(createUserDto);
  }

  @Get()
  @Roles('admin')
  @ApiOperation({ summary: 'Récupérer tous les utilisateurs (Admin uniquement)' })
  @ApiResponse({ status: 200, description: 'Liste des utilisateurs', type: [User] })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiQuery({ name: 'role', required: false, enum: ['admin', 'examiner', 'candidate'] })
  async findAll(@Request() req): Promise<User[]> {
    // Seul un admin peut voir tous les utilisateurs
    if (req.user.role !== 'admin') {
      throw new ForbiddenException('Accès non autorisé');
    }
    return this.usersService.findAll();
  }

  @Get('profile')
  @ApiOperation({ summary: 'Récupérer le profil de l\'utilisateur connecté' })
  @ApiResponse({ status: 200, description: 'Profil utilisateur', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  async getProfile(@Request() req) {
    return this.usersService.findById(req.user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Récupérer un utilisateur par son ID' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur' })
  @ApiResponse({ status: 200, description: 'Utilisateur trouvé', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async findOne(@Param('id') id: string, @Request() req): Promise<User> {
    // Un utilisateur ne peut voir que son propre profil, sauf s'il est admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('Accès non autorisé à ce profil');
    }
    return this.usersService.findById(id);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Mettre à jour un utilisateur' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur à mettre à jour' })
  @ApiResponse({ status: 200, description: 'Utilisateur mis à jour', type: User })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  @ApiBody({ type: UpdateUserDto })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Request() req
  ): Promise<User> {
    // Un utilisateur ne peut mettre à jour que son propre profil, sauf s'il est admin
    if (req.user.role !== 'admin' && req.user.id !== id) {
      throw new ForbiddenException('Vous ne pouvez pas modifier ce profil');
    }
    
    // Empêcher la modification du rôle, sauf pour les admins
    if (updateUserDto.role && req.user.role !== 'admin') {
      throw new ForbiddenException('Vous ne pouvez pas modifier le rôle');
    }
    
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles('admin')
  @ApiOperation({ summary: 'Supprimer un utilisateur (Admin uniquement)' })
  @ApiParam({ name: 'id', description: 'ID de l\'utilisateur à supprimer' })
  @ApiResponse({ status: 200, description: 'Utilisateur supprimé' })
  @ApiResponse({ status: 404, description: 'Utilisateur non trouvé' })
  @ApiResponse({ status: 403, description: 'Accès refusé' })
  async remove(@Param('id') id: string, @Request() req): Promise<void> {
    // Un admin ne peut pas se supprimer lui-même
    if (req.user.id === id) {
      throw new ForbiddenException('Vous ne pouvez pas supprimer votre propre compte');
    }
    
    return this.usersService.remove(id);
  }
}
