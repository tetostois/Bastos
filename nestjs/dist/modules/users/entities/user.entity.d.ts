export declare enum UserRole {
    ADMIN = "admin",
    EXAMINER = "examiner",
    CANDIDATE = "candidate"
}
export declare class User {
    id: string;
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    birthDate: Date;
    birthPlace: string;
    city: string;
    country: string;
    profession: string;
    specialization: string;
    experience: string;
    role: UserRole;
    isActive: boolean;
    emailVerified: boolean;
    verificationToken: string;
    resetPasswordToken: string;
    resetPasswordExpires: Date;
    hasPaid: boolean;
    examTaken: boolean;
    score: number;
    certificate: string;
    selectedCertification: string;
    completedModules: string[];
    currentModule: string;
    examStartDate: Date;
    examiner: User;
    examinerId: string;
    createdAt: Date;
    updatedAt: Date;
    hashPassword(): Promise<void>;
    comparePassword(attempt: string): Promise<boolean>;
    getFullName(): string;
    isAdmin(): boolean;
    isExaminer(): boolean;
    isCandidate(): boolean;
}
