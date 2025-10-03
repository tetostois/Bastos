export declare class CreateUserDto {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone: string;
    address?: string;
    birthDate?: string;
    birthPlace?: string;
    city?: string;
    country?: string;
    profession?: string;
    role?: 'admin' | 'examiner' | 'candidate';
}
