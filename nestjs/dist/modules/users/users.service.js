"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const uuid_1 = require("uuid");
const user_entity_1 = require("./entities/user.entity");
const user_response_dto_1 = require("./dto/user-response.dto");
let UsersService = class UsersService {
    usersRepository;
    constructor(usersRepository) {
        this.usersRepository = usersRepository;
    }
    async createAdmin(createAdminDto) {
        return this.createUser({
            ...createAdminDto,
            birthDate: createAdminDto.birthDate ? new Date(createAdminDto.birthDate) : undefined,
            role: user_entity_1.UserRole.ADMIN,
        });
    }
    async createExaminer(createExaminerDto) {
        return this.createUser({
            ...createExaminerDto,
            birthDate: createExaminerDto.birthDate ? new Date(createExaminerDto.birthDate) : undefined,
            role: user_entity_1.UserRole.EXAMINER,
        });
    }
    async registerCandidate(createCandidateDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { email: createCandidateDto.email }
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already registered');
        }
        const verificationToken = (0, uuid_1.v4)();
        const user = await this.createUser({
            ...createCandidateDto,
            birthDate: createCandidateDto.birthDate ? new Date(createCandidateDto.birthDate) : undefined,
            role: user_entity_1.UserRole.CANDIDATE,
            emailVerified: false,
            verificationToken,
        });
        return user;
    }
    async createUser(userData) {
        try {
            const user = this.usersRepository.create(userData);
            const savedUser = await this.usersRepository.save(user);
            return new user_response_dto_1.UserResponseDto(savedUser);
        }
        catch (error) {
            if (error.code === '23505') {
                throw new common_1.ConflictException('Email already exists');
            }
            throw new common_1.InternalServerErrorException('Failed to create user');
        }
    }
    async findAll(role) {
        const where = role ? { role } : {};
        const users = await this.usersRepository.find({
            where,
            order: { createdAt: 'DESC' }
        });
        return users.map(user => new user_response_dto_1.UserResponseDto(user));
    }
    async findById(id) {
        const user = await this.usersRepository.findOne({
            where: { id }
        });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        return new user_response_dto_1.UserResponseDto(user);
    }
    async findByEmail(email) {
        return this.usersRepository.findOne({
            where: { email },
            select: ['id', 'email', 'password', 'role', 'isActive', 'emailVerified']
        });
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
        if (updateUserDto.role && !currentUser.isAdmin()) {
            throw new common_1.BadRequestException('Only administrators can change user roles');
        }
        if (currentUser.id !== id && !currentUser.isAdmin()) {
            throw new common_1.BadRequestException('You can only update your own profile');
        }
        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const emailExists = await this.usersRepository.findOne({
                where: { email: updateUserDto.email, id: (0, typeorm_2.Not)(id) }
            });
            if (emailExists) {
                throw new common_1.ConflictException('Email already in use');
            }
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        const updateData = {
            ...updateUserDto,
            ...(updateUserDto.birthDate && { birthDate: new Date(updateUserDto.birthDate) })
        };
        Object.assign(user, updateData);
        const updatedUser = await this.usersRepository.save(user);
        return new user_response_dto_1.UserResponseDto(updatedUser);
    }
    async remove(id, currentUser) {
        if (currentUser.id === id) {
            throw new common_1.BadRequestException('You cannot delete your own account');
        }
        const result = await this.usersRepository.delete(id);
        if (result.affected === 0) {
            throw new common_1.NotFoundException(`User with ID ${id} not found`);
        }
    }
    async markExamTaken(userId) {
        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
                role: user_entity_1.UserRole.CANDIDATE
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        user.examTaken = true;
        user.examStartDate = new Date();
        const updatedUser = await this.usersRepository.save(user);
        return new user_response_dto_1.UserResponseDto(updatedUser);
    }
    async updateScore(userId, score) {
        if (score < 0 || score > 100) {
            throw new common_1.BadRequestException('Score must be between 0 and 100');
        }
        const user = await this.usersRepository.findOne({
            where: {
                id: userId,
                role: user_entity_1.UserRole.CANDIDATE
            }
        });
        if (!user) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        user.score = score;
        user.examTaken = true;
        const updatedUser = await this.usersRepository.save(user);
        return new user_response_dto_1.UserResponseDto(updatedUser);
    }
    async findExaminers() {
        const examiners = await this.usersRepository.find({
            where: {
                role: user_entity_1.UserRole.EXAMINER,
                isActive: true
            },
            order: { lastName: 'ASC' }
        });
        return examiners.map(examiner => new user_response_dto_1.UserResponseDto(examiner));
    }
    async findCandidates() {
        const candidates = await this.usersRepository.find({
            where: {
                role: user_entity_1.UserRole.CANDIDATE
            },
            order: { lastName: 'ASC' }
        });
        return candidates.map(candidate => new user_response_dto_1.UserResponseDto(candidate));
    }
    async assignExaminer(candidateId, examinerId) {
        const [candidate, examiner] = await Promise.all([
            this.usersRepository.findOne({
                where: {
                    id: candidateId,
                    role: user_entity_1.UserRole.CANDIDATE
                }
            }),
            this.usersRepository.findOne({
                where: {
                    id: examinerId,
                    role: user_entity_1.UserRole.EXAMINER
                }
            })
        ]);
        if (!candidate) {
            throw new common_1.NotFoundException('Candidate not found');
        }
        if (!examiner) {
            throw new common_1.NotFoundException('Examiner not found');
        }
        if (!examiner.isActive) {
            throw new common_1.BadRequestException('Cannot assign an inactive examiner');
        }
        candidate.examinerId = examinerId;
        const updatedCandidate = await this.usersRepository.save(candidate);
        return new user_response_dto_1.UserResponseDto(updatedCandidate);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map