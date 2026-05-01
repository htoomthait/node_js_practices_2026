import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";
import { PrismaService } from "src/prisma/prisma.service";
import { Parser } from 'json2csv';
import * as fs from 'fs';
import * as path from 'path';


@Processor('export-users-csv', { concurrency: 1 })
export class UserExportCsvProcessor extends WorkerHost {

    private readonly logger = new Logger(UserExportCsvProcessor.name);

    constructor(private readonly prisma: PrismaService) {
        super();
    }

    async process(job: any) {
        this.logger.log(`Processing export users CSV job with ID: ${job.id} and data: ${JSON.stringify(job.data)}`);
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 3000));

        const { jobId } = job.data;
        this.logger.log(`Starting CSV export for job ${jobId}`);

        // 1. Fetch data
        const users = await this.prisma.user.findMany();

        // 2. Convert to CSV
        const parser = new Parser();
        const csv = parser.parse(users);

        // 3. Save file
        const filePath = path.join(process.cwd(), 'downloads', `${jobId}.csv`);

        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, csv);

        this.logger.log(`Completed export users CSV job with ID: ${job.id}`);
    }

}