import * as cron from "node-cron";
import { runLinkTestingJob } from "./testLinks";
import { logger } from "../index";

export class CronScheduler {
  private static instance: CronScheduler;
  private jobs: Map<string, cron.ScheduledTask> = new Map();

  private constructor() {}

  public static getInstance(): CronScheduler {
    if (!CronScheduler.instance) {
      CronScheduler.instance = new CronScheduler();
    }
    return CronScheduler.instance;
  }

  /**
   * Start all cron jobs
   */
  public startAll(): void {
    logger.info("Starting cron jobs...");

    // Daily link testing at 2 AM
    this.startLinkTestingJob();

    logger.info("All cron jobs started successfully");
  }

  /**
   * Stop all cron jobs
   */
  public stopAll(): void {
    logger.info("Stopping all cron jobs...");

    this.jobs.forEach((task, name) => {
      task.stop();
      logger.info(`Stopped cron job: ${name}`);
    });

    this.jobs.clear();
    logger.info("All cron jobs stopped");
  }

  /**
   * Start the daily link testing job
   */
  private startLinkTestingJob(): void {
    const jobName = "link-testing";

    // Schedule to run daily at 2:00 AM
    // Cron format: second minute hour day month dayOfWeek
    // '0 2 * * *' = At 2:00 AM every day
    const task = cron.schedule(
      "0 2 * * *",
      async () => {
        logger.info("Starting scheduled link testing job");
        try {
          await runLinkTestingJob();
          logger.info("Scheduled link testing job completed successfully");
        } catch (error) {
          logger.error("Scheduled link testing job failed:", error);
        }
      },
      {
        timezone: "UTC",
      }
    );

    this.jobs.set(jobName, task);
    logger.info(`Started cron job: ${jobName} - Daily at 2:00 AM UTC`);
  }

  /**
   * Manually trigger the link testing job
   */
  public async triggerLinkTesting(): Promise<void> {
    logger.info("Manually triggering link testing job");
    try {
      await runLinkTestingJob();
      logger.info("Manual link testing job completed successfully");
    } catch (error) {
      logger.error("Manual link testing job failed:", error);
      throw error;
    }
  }

  /**
   * Get status of all cron jobs
   */
  public getJobsStatus(): { name: string; running: boolean }[] {
    const status: { name: string; running: boolean }[] = [];

    this.jobs.forEach((task, name) => {
      status.push({
        name,
        running: true, // node-cron doesn't expose status, assume running if in map
      });
    });

    return status;
  }

  /**
   * Restart a specific job
   */
  public restartJob(jobName: string): boolean {
    const task = this.jobs.get(jobName);
    if (task) {
      task.stop();
      task.start();
      logger.info(`Restarted cron job: ${jobName}`);
      return true;
    }
    return false;
  }
}

// Export singleton instance
export const cronScheduler = CronScheduler.getInstance();
