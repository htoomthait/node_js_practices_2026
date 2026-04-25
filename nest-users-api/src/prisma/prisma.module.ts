// src/prisma/prisma.module.ts
import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global() // Optional: Makes PrismaService available everywhere without re-importing
@Module({
    providers: [PrismaService],
    exports: [PrismaService], // This is the most important part!
})
export class PrismaModule { }