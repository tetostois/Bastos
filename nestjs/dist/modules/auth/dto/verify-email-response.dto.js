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
exports.VerifyEmailResponseDto = void 0;
const swagger_1 = require("@nestjs/swagger");
class VerifyEmailResponseDto {
    success;
    message;
    canLogin;
}
exports.VerifyEmailResponseDto = VerifyEmailResponseDto;
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indique si la vérification a réussi',
        example: true,
    }),
    __metadata("design:type", Boolean)
], VerifyEmailResponseDto.prototype, "success", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Message détaillant le résultat de la vérification',
        example: 'Votre adresse email a été vérifiée avec succès !',
    }),
    __metadata("design:type", String)
], VerifyEmailResponseDto.prototype, "message", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Indique si l\'utilisateur peut maintenant se connecter',
        example: true,
        required: false,
    }),
    __metadata("design:type", Boolean)
], VerifyEmailResponseDto.prototype, "canLogin", void 0);
//# sourceMappingURL=verify-email-response.dto.js.map