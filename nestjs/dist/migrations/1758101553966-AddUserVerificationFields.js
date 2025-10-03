"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddUserVerificationFields1758101553966 = void 0;
const typeorm_1 = require("typeorm");
class AddUserVerificationFields1758101553966 {
    async up(queryRunner) {
        await queryRunner.addColumns('users', [
            new typeorm_1.TableColumn({
                name: 'emailVerified',
                type: 'boolean',
                default: false,
            }),
            new typeorm_1.TableColumn({
                name: 'verificationToken',
                type: 'varchar',
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: 'verificationTokenExpires',
                type: 'datetime',
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: 'passwordResetToken',
                type: 'varchar',
                isNullable: true,
            }),
            new typeorm_1.TableColumn({
                name: 'passwordResetExpires',
                type: 'datetime',
                isNullable: true,
            }),
        ]);
    }
    async down(queryRunner) {
        await queryRunner.dropColumns('users', [
            'emailVerified',
            'verificationToken',
            'verificationTokenExpires',
            'passwordResetToken',
            'passwordResetExpires',
        ]);
    }
}
exports.AddUserVerificationFields1758101553966 = AddUserVerificationFields1758101553966;
//# sourceMappingURL=1758101553966-AddUserVerificationFields.js.map