import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Logger } from "@nestjs/common";

@Processor('user-queue')
export class LoggingProcessor extends WorkerHost {

    private readonly logger = new Logger(LoggingProcessor.name);

    async process(job: any) {
        this.logger.log(`Processing job ${job.id} with data: ${JSON.stringify(job.data)}`);
        // Simulate some work
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.logger.log(`Completed job ${job.id}`);
    }


}