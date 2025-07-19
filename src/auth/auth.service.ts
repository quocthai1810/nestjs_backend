import { HttpException, HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';
import { decodePassword, encodePassword } from 'src/utils/bcrypt';

@Injectable()
export class AuthService {

    constructor(private readonly prisma: PrismaService, private readonly jwtService: JwtService, private readonly config: ConfigService) { }

    async register(user: Prisma.UserCreateInput) {
        const passwordHashed = encodePassword(user.password);

        const createdUser = await this.prisma.user.create({
            data: {
                ...user,
                password: passwordHashed,
            },
        });
        const payload = {
            sub: createdUser.id,
            role: createdUser.role
        };

        const { accessToken, refreshToken } = this.generateTokens(payload);

        await this.prisma.user.update({
            where: { id: createdUser.id },
            data: { refreshToken },
        });

        return {
            accessToken,
            refreshToken,
            user: createdUser,
        };
    }


    async validateUser(user: Prisma.UserCreateInput) {
        const findUser = await this.prisma.user.findUnique({
            where: { email: user.email },
        });

        if (!findUser) {
            throw new HttpException('User not found', HttpStatus.NOT_FOUND);
        }

        const isMatched = decodePassword(user.password, findUser.password);
        if (!isMatched) {
            throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
        }

        const payload = {
            sub: findUser.id,
            role: findUser.role
        };

        // ✅ Tạo token mới
        const tokens = this.generateTokens(payload);

        // ✅ Cập nhật refreshToken mới vào DB (đã hash nếu bạn hash nó)
        await this.prisma.user.update({
            where: { id: findUser.id },
            data: {
                refreshToken: tokens.refreshToken,
            },
        });

        return {
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            user: findUser,
        };
    }


    async refreshTokens(refreshToken: string) {
        try {
            // 1. Giải mã refresh token
            const payload = this.jwtService.verify(refreshToken, {
                secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            });

            // 2. Tìm user từ payload
            const user = await this.prisma.user.findUnique({
                where: { id: payload.sub },
            });

            if (!user || !user.refreshToken) {
                throw new UnauthorizedException('Invalid User!');
            }

            // 4. Tạo access token mới
            const newAccessToken = this.jwtService.sign(
                {
                    sub: user.id,
                    role: user.role
                },
                {
                    secret: this.config.get<string>('JWT_ACCESS_SECRET'),
                    expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
                },
            );

            return {newAccessToken,user};
        } catch (err) {
            throw new UnauthorizedException('Refresh token is invalid or has expired');
        }
    }


    generateTokens(payload: any) {
        const accessToken = this.jwtService.sign(payload, {
            secret: this.config.get<string>('JWT_ACCESS_SECRET'),
            expiresIn: this.config.get<string>('JWT_ACCESS_EXPIRES_IN'),
        });

        const refreshToken = this.jwtService.sign(payload, {
            secret: this.config.get<string>('JWT_REFRESH_SECRET'),
            expiresIn: this.config.get<string>('JWT_REFRESH_EXPIRES_IN'),
        });

        return { accessToken, refreshToken };
    }
}
