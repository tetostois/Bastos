import { UserRole } from '../entities/user.entity';
export declare class UpdateUserDto {
    email?: string;
    password?: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    address?: string;
    birthDate?: string;
    birthPlace?: string;
    city?: string;
    country?: string;
    profession?: string;
    specialization?: string;
    experience?: string;
    isActive?: boolean;
    emailVerified?: boolean;
    hasPaid?: boolean;
    examTaken?: boolean;
    score?: number;
    certificate?: string;
    selectedCertification?: string;
    completedModules?: string[];
    currentModule?: string;
    examStartDate?: Date;
    role?: UserRole;
}
