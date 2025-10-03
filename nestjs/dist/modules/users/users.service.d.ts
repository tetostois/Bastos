import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { CreateAdminDto } from './dto/create-admin.dto';
import { CreateExaminerDto } from './dto/create-examiner.dto';
import { CreateCandidateDto } from './dto/create-candidate.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
export declare class UsersService {
    private usersRepository;
    constructor(usersRepository: Repository<User>);
    createAdmin(createAdminDto: CreateAdminDto): Promise<UserResponseDto>;
    createExaminer(createExaminerDto: CreateExaminerDto): Promise<UserResponseDto>;
    registerCandidate(createCandidateDto: CreateCandidateDto): Promise<UserResponseDto>;
    private createUser;
    findAll(role?: UserRole): Promise<UserResponseDto[]>;
    findById(id: string): Promise<UserResponseDto>;
    findByEmail(email: string): Promise<User | null>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: User): Promise<UserResponseDto>;
    remove(id: string, currentUser: User): Promise<void>;
    markExamTaken(userId: string): Promise<UserResponseDto>;
    updateScore(userId: string, score: number): Promise<UserResponseDto>;
    findExaminers(): Promise<UserResponseDto[]>;
    findCandidates(): Promise<UserResponseDto[]>;
    assignExaminer(candidateId: string, examinerId: string): Promise<UserResponseDto>;
}
