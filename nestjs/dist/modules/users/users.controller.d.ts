import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateExaminerDto } from './dto/create-examiner.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { UserRole } from './entities/user.entity';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersController {
    private readonly usersService;
    private usersRepository;
    constructor(usersService: UsersService, usersRepository: Repository<User>);
    createAdmin(createAdminDto: CreateAdminDto, req: any): Promise<UserResponseDto>;
    createExaminer(createExaminerDto: CreateExaminerDto, req: any): Promise<UserResponseDto>;
    findAll(role?: UserRole, page?: number, limit?: number): Promise<{
        data: UserResponseDto[];
        total: number;
    }>;
    findAllExaminers(): Promise<UserResponseDto[]>;
    findAllCandidates(): Promise<UserResponseDto[]>;
    registerCandidate(createCandidateDto: CreateCandidateDto): Promise<UserResponseDto>;
    getProfile(req: any): Promise<UserResponseDto>;
    findOne(id: string, req: any): Promise<UserResponseDto>;
    update(id: string, updateUserDto: UpdateUserDto, req: any): Promise<UserResponseDto>;
    remove(id: string, req: any): Promise<void>;
    assignExaminer(candidateId: string, examinerId: string, req: any): Promise<UserResponseDto>;
    updateScore(candidateId: string, score: number, req: any): Promise<UserResponseDto>;
    markExamTaken(candidateId: string, req: any): Promise<UserResponseDto>;
}
