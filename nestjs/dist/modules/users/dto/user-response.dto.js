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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserResponseDto {
    id;
    email;
    examinerId;
    firstName;
    lastName;
    phone;
    address;
    birthDate;
    birthPlace;
    city;
    country;
    profession;
    role;
    specialization;
    experience;
    isActive;
    emailVerified;
    hasPaid;
    examTaken;
    score;
    certificate;
    selectedCertification;
    completedModules;
    currentModule;
    examStartDate;
    createdAt;
    updatedAt;
    constructor(user) {
        this.id = user.id;
        this.email = user.email;
        this.firstName = user.firstName;
        this.lastName = user.lastName;
        this.phone = user.phone;
        this.address = user.address;
        this.birthDate = user.birthDate;
        this.birthPlace = user.birthPlace;
        this.city = user.city;
        this.country = user.country;
        this.profession = user.profession;
        this.role = user.role;
        this.specialization = user.specialization;
        this.experience = user.experience;
        this.isActive = user.isActive;
        this.emailVerified = user.emailVerified;
        this.hasPaid = user.hasPaid;
        this.examTaken = user.examTaken;
        this.score = user.score;
        this.certificate = user.certificate;
        this.selectedCertification = user.selectedCertification;
        this.completedModules = user.completedModules;
        this.currentModule = user.currentModule;
        this.examStartDate = user.examStartDate;
        this.createdAt = user.createdAt;
        this.updatedAt = user.updatedAt;
    }
}
exports.UserResponseDto = UserResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440000', description: 'Unique identifier' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'user@example.com', description: 'Email address' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '550e8400-e29b-41d4-a716-446655440001', description: 'Examiner ID (for candidates)', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "examinerId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'John', description: 'First name' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Doe', description: 'Last name' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '+237612345678', description: 'Phone number', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '123 Main St', description: 'Full address', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: '1990-01-01', description: 'Date of birth (YYYY-MM-DD)', required: false }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yaounde', description: 'Place of birth', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "birthPlace", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Yaounde', description: 'City of residence', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Cameroon', description: 'Country of residence', default: 'Cameroon' }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Software Developer', description: 'Profession', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "profession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        enum: ['admin', 'examiner', 'candidate'],
        enumName: 'UserRole',
        example: 'candidate',
        description: 'User role'
    }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Computer Science', description: 'Area of specialization', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "specialization", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '5+ years of experience in software development',
        description: 'Professional experience',
        required: false
    }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "experience", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the user account is active', default: true }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "isActive", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the email is verified', default: false }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "emailVerified", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the candidate has paid', default: false, required: false }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "hasPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Whether the exam has been taken', default: false, required: false }),
    __metadata("design:type", Boolean)
], UserResponseDto.prototype, "examTaken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 85.5, description: 'Exam score', required: false }),
    __metadata("design:type", Number)
], UserResponseDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'CERT12345', description: 'Certificate ID', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "certificate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: 'AWS Certified Developer',
        description: 'Selected certification',
        required: false
    }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "selectedCertification", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: ['module1', 'module2'],
        description: 'List of completed modules',
        type: [String],
        required: false
    }),
    __metadata("design:type", Array)
], UserResponseDto.prototype, "completedModules", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'module3', description: 'Current module', required: false }),
    __metadata("design:type", String)
], UserResponseDto.prototype, "currentModule", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T10:00:00Z',
        description: 'Exam start date and time',
        required: false
    }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "examStartDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Date when the account was created'
    }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        example: '2023-01-01T00:00:00.000Z',
        description: 'Date when the account was last updated'
    }),
    __metadata("design:type", Date)
], UserResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-response.dto.js.map