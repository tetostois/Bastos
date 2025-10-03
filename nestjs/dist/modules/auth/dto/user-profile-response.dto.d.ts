export declare class UserProfileResponseDto {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
    birthDate?: string;
    birthPlace?: string;
    city?: string;
    country: string;
    profession?: string;
    role: string;
    hasPaid: boolean;
    examTaken: boolean;
    score?: number;
    level?: string;
    createdAt: Date;
    updatedAt: Date;
}
