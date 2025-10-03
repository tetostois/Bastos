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
exports.UserProfileResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class UserProfileResponseDto {
    id;
    email;
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
    hasPaid;
    examTaken;
    score;
    level;
    createdAt;
    updatedAt;
}
exports.UserProfileResponseDto = UserProfileResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique identifier of the user',
        example: '123e4567-e89b-12d3-a456-426614174000',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Email address of the user',
        example: 'user@example.com',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'First name of the user',
        example: 'John',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "firstName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Last name of the user',
        example: 'Doe',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "lastName", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Phone number of the user',
        example: '+237123456789',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Address of the user',
        example: '123 Main Street',
        required: false,
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "address", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date of birth of the user',
        example: '1990-01-01',
        required: false,
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "birthDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Place of birth of the user',
        example: 'Yaoundé',
        required: false,
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "birthPlace", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'City of residence',
        example: 'Douala',
        required: false,
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Country of residence',
        example: 'Cameroon',
        default: 'Cameroon',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Profession of the user',
        example: 'Software Developer',
        required: false,
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "profession", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Role of the user in the system',
        enum: ['admin', 'examiner', 'candidate'],
        example: 'candidate',
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the user has paid for the certification',
        default: false,
    }),
    __metadata("design:type", Boolean)
], UserProfileResponseDto.prototype, "hasPaid", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Whether the user has taken the exam',
        default: false,
    }),
    __metadata("design:type", Boolean)
], UserProfileResponseDto.prototype, "examTaken", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User\'s score on the exam',
        required: false,
        example: 85.5,
    }),
    __metadata("design:type", Number)
], UserProfileResponseDto.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User\'s level (for candidates)',
        enum: ['debutant', 'intermediaire', 'expert'],
        example: 'debutant',
        required: false,
    }),
    __metadata("design:type", String)
], UserProfileResponseDto.prototype, "level", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when the user was created',
        example: '2023-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserProfileResponseDto.prototype, "createdAt", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Date when the user was last updated',
        example: '2023-01-01T00:00:00.000Z',
    }),
    __metadata("design:type", Date)
], UserProfileResponseDto.prototype, "updatedAt", void 0);
//# sourceMappingURL=user-profile-response.dto.js.map