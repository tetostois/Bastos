"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const users_service_1 = require("./users.service");
const create_admin_dto_1 = require("./dto/create-admin.dto");
const create_examiner_dto_1 = require("./dto/create-examiner.dto");
const create_candidate_dto_1 = require("./dto/create-candidate.dto");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_entity_1 = require("./entities/user.entity");
const user_entity_2 = require("./entities/user.entity");
const user_response_dto_1 = require("./dto/user-response.dto");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
const roles_guard_1 = require("../../common/guards/roles.guard");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
let UsersController = class UsersController {
    usersService;
    usersRepository;
    constructor(usersService, usersRepository) {
        this.usersService = usersService;
        this.usersRepository = usersRepository;
    }
    async createAdmin(createAdminDto, req) {
        return this.usersService.createAdmin(createAdminDto);
    }
    async createExaminer(createExaminerDto, req) {
        return this.usersService.createExaminer(createExaminerDto);
    }
    async findAll(role, page = 1, limit = 10) {
        const [users, total] = await this.usersRepository.findAndCount({
            where: role ? { role } : {},
            skip: (page - 1) * limit,
            take: limit,
            order: { createdAt: 'DESC' },
            relations: ['examiner'],
        });
        return {
            data: users.map(user => new user_response_dto_1.UserResponseDto(user)),
            total,
        };
    }
    async findAllExaminers() {
        return this.usersService.findExaminers();
    }
    async findAllCandidates() {
        return this.usersService.findCandidates();
    }
    async registerCandidate(createCandidateDto) {
        return this.usersService.registerCandidate(createCandidateDto);
    }
    async getProfile(req) {
        return this.usersService.findById(req.user.id);
    }
    async findOne(id, req) {
        if (req.user.role !== user_entity_2.UserRole.ADMIN && req.user.id !== id) {
            throw new common_1.ForbiddenException('You can only view your own profile');
        }
        return this.usersService.findById(id);
    }
    async update(id, updateUserDto, req) {
        if (req.user.role !== user_entity_2.UserRole.ADMIN && req.user.id !== id) {
            throw new common_1.ForbiddenException('You can only update your own profile');
        }
        return this.usersService.update(id, updateUserDto, req.user);
    }
    async remove(id, req) {
        return this.usersService.remove(id, req.user);
    }
    async assignExaminer(candidateId, examinerId, req) {
        return this.usersService.assignExaminer(candidateId, examinerId);
    }
    async updateScore(candidateId, score, req) {
        if (req.user.role === user_entity_2.UserRole.EXAMINER) {
            const candidate = await this.usersRepository.findOne({
                where: { id: candidateId },
                relations: ['examiner']
            });
            if (!candidate || !candidate.examiner || candidate.examiner.id !== req.user.id) {
                throw new common_1.ForbiddenException('You can only update scores for your assigned candidates');
            }
        }
        return this.usersService.updateScore(candidateId, score);
    }
    async markExamTaken(candidateId, req) {
        if (req.user.role === user_entity_2.UserRole.EXAMINER) {
            const candidate = await this.usersRepository.findOne({
                where: { id: candidateId },
                relations: ['examiner']
            });
            if (!candidate || !candidate.examiner || candidate.examiner.id !== req.user.id) {
                throw new common_1.ForbiddenException('You can only update your assigned candidates');
            }
        }
        return this.usersService.markExamTaken(candidateId);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, common_1.Post)('admins'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un administrateur',
        description: 'Crée un nouveau compte administrateur. Nécessite les droits administrateur.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Administrateur créé avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_admin_dto_1.CreateAdminDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createAdmin", null);
__decorate([
    (0, common_1.Post)('examiners'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Créer un examinateur',
        description: 'Crée un nouveau compte examinateur. Nécessite les droits administrateur.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Examinateur créé avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_examiner_dto_1.CreateExaminerDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "createExaminer", null);
__decorate([
    (0, common_1.Get)(),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister tous les utilisateurs',
        description: 'Récupère la liste paginée de tous les utilisateurs. Nécessite les droits administrateur.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des utilisateurs récupérée avec succès', type: [user_response_dto_1.UserResponseDto] }),
    (0, swagger_1.ApiQuery)({ name: 'role', enum: user_entity_2.UserRole, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number, example: 1 }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number, example: 10 }),
    (0, swagger_1.ApiOkResponse)({ type: [user_response_dto_1.UserResponseDto] }),
    __param(0, (0, common_1.Query)('role')),
    __param(1, (0, common_1.Query)('page', new common_1.DefaultValuePipe(1), common_1.ParseIntPipe)),
    __param(2, (0, common_1.Query)('limit', new common_1.DefaultValuePipe(10), common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('examiners'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les examinateurs',
        description: 'Récupère la liste de tous les examinateurs. Nécessite les droits administrateur.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des examinateurs récupérée avec succès', type: [user_response_dto_1.UserResponseDto] }),
    (0, swagger_1.ApiOkResponse)({ type: [user_response_dto_1.UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllExaminers", null);
__decorate([
    (0, common_1.Get)('candidates'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN, user_entity_2.UserRole.EXAMINER),
    (0, swagger_1.ApiOperation)({
        summary: 'Lister les candidats',
        description: 'Récupère la liste de tous les candidats. Accessible aux administrateurs et examinateurs.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Liste des candidats récupérée avec succès', type: [user_response_dto_1.UserResponseDto] }),
    (0, swagger_1.ApiOkResponse)({ type: [user_response_dto_1.UserResponseDto] }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findAllCandidates", null);
__decorate([
    (0, common_1.Post)('register'),
    (0, swagger_1.ApiOperation)({
        summary: 'Inscription candidat',
        description: 'Permet à un nouveau candidat de s\'inscrire. Aucune authentification requise.'
    }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Candidat inscrit avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données d\'inscription invalides' }),
    (0, swagger_1.ApiResponse)({ status: 409, description: 'Email déjà utilisé' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_candidate_dto_1.CreateCandidateDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "registerCandidate", null);
__decorate([
    (0, common_1.Get)('profile'),
    (0, swagger_1.ApiOperation)({
        summary: 'Profil utilisateur',
        description: 'Récupère les informations du profil de l\'utilisateur connecté.'
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Profil utilisateur récupéré avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getProfile", null);
__decorate([
    (0, common_1.Get)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Obtenir un utilisateur par ID',
        description: 'Récupère les informations d\'un utilisateur par son identifiant. Un utilisateur ne peut voir que son propre profil, sauf s\'il est administrateur.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant UUID de l\'utilisateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur trouvé', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "findOne", null);
__decorate([
    (0, common_1.Put)(':id'),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour un utilisateur',
        description: 'Met à jour les informations d\'un utilisateur. Un utilisateur ne peut mettre à jour que son propre profil, sauf s\'il est administrateur.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant UUID de l\'utilisateur à mettre à jour' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur mis à jour avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données de mise à jour invalides' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_user_dto_1.UpdateUserDto, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Supprimer un utilisateur',
        description: 'Supprime un utilisateur du système. Nécessite les droits administrateur. Impossible de supprimer son propre compte.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant UUID de l\'utilisateur à supprimer' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Utilisateur supprimé avec succès' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Impossible de supprimer son propre compte' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Utilisateur non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "remove", null);
__decorate([
    (0, common_1.Post)(':candidateId/assign-examiner/:examinerId'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Assigner un examinateur à un candidat',
        description: 'Assigne un examinateur à un candidat. Nécessite les droits administrateur.'
    }),
    (0, swagger_1.ApiParam)({ name: 'candidateId', description: 'Identifiant UUID du candidat' }),
    (0, swagger_1.ApiParam)({ name: 'examinerId', description: 'Identifiant UUID de l\'examinateur' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Examinateur assigné avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Données invalides' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidat ou examinateur non trouvé' }),
    __param(0, (0, common_1.Param)('candidateId')),
    __param(1, (0, common_1.Param)('examinerId')),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "assignExaminer", null);
__decorate([
    (0, common_1.Put)(':id/score'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.EXAMINER, user_entity_2.UserRole.ADMIN),
    (0, swagger_1.ApiOperation)({
        summary: 'Mettre à jour le score d\'un candidat',
        description: 'Met à jour le score d\'un candidat. Un examinateur ne peut mettre à jour que le score de ses candidats assignés.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant UUID du candidat' }),
    (0, swagger_1.ApiBody)({
        schema: {
            type: 'object',
            properties: {
                score: { type: 'number', example: 85, description: 'Nouveau score (0-100)' }
            },
            required: ['score']
        }
    }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Score mis à jour avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Score invalide (doit être entre 0 et 100)' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidat non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)('score', new common_1.ParseIntPipe())),
    __param(2, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateScore", null);
__decorate([
    (0, common_1.Post)(':id/mark-exam-taken'),
    (0, roles_decorator_1.Roles)(user_entity_2.UserRole.ADMIN, user_entity_2.UserRole.EXAMINER),
    (0, swagger_1.ApiOperation)({
        summary: 'Marquer un examen comme passé',
        description: 'Marque l\'examen d\'un candidat comme passé. Un examinateur ne peut marquer que ses candidats assignés.'
    }),
    (0, swagger_1.ApiParam)({ name: 'id', description: 'Identifiant UUID du candidat' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Examen marqué comme passé avec succès', type: user_response_dto_1.UserResponseDto }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès non autorisé' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Candidat non trouvé' }),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "markExamTaken", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('Users'),
    (0, common_1.Controller)('users'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    (0, common_1.UseInterceptors)(common_1.ClassSerializerInterceptor),
    (0, common_1.UsePipes)(new common_1.ValidationPipe({ transform: true, whitelist: true })),
    (0, swagger_1.ApiBearerAuth)('JWT-auth'),
    (0, swagger_1.ApiResponse)({ status: 401, description: 'Non autorisé - Token JWT manquant ou invalide' }),
    (0, swagger_1.ApiResponse)({ status: 403, description: 'Accès refusé - Droits insuffisants' }),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        typeorm_2.Repository])
], UsersController);
//# sourceMappingURL=users.controller.js.map