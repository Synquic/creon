import axios from "axios";
import { Link, Product } from "../models";
import { logger } from "../index";
import { ILink, IProduct } from "../types";

export interface LinkTestResult {
  linkId: string;
  url: string;
  isWorking: boolean;
  statusCode?: number;
  error?: string;
  responseTime?: number;
  finalUrl?: string;
  testType?: "standard" | "nykaa" | "tira";
  itemType?: "link" | "product";
}

export class LinkTester {
  private static readonly TIMEOUT = 10000; // 10 seconds timeout
  private static readonly USER_AGENT = "Creon Link Checker 1.0";

  /**
   * Determine if a URL requires special testing logic
   */
  private static getTestType(url: string): "standard" | "nykaa" | "tira" {
    if (url.includes("nykaa.onelink.me") || url.includes("nykaa.com")) {
      return "nykaa";
    }
    if (url.includes("tirabeauty.com")) {
      return "tira";
    }
    return "standard";
  }

  /**
   * Check if a final URL indicates a working product page
   */
  private static isProductPage(
    finalUrl: string,
    testType: "nykaa" | "tira"
  ): boolean {
    switch (testType) {
      case "nykaa":
        // Check for /p/ pattern or ?productId= parameter
        return (
          finalUrl.includes("/p/") ||
          finalUrl.includes("?productId=") ||
          finalUrl.includes("&productId=")
        );

      case "tira":
        // Check for /product/ pattern
        return finalUrl.includes("/product/");

      default:
        return false;
    }
  }

  /**
   * Test a single item (link or product) and return the result
   */
  static async testSingleItem(
    itemId: string,
    url: string,
    itemType: "link" | "product"
  ): Promise<LinkTestResult> {
    const startTime = Date.now();
    const testType = this.getTestType(url);

    try {
      logger.info(`Testing ${itemType}: ${url} (type: ${testType})`);

      const response = await axios.get(url, {
        timeout: this.TIMEOUT,
        headers: {
          "User-Agent": this.USER_AGENT,
        },
        maxRedirects: 10, // Allow following redirects
        validateStatus: function (status) {
          // Don't throw error for any status code, we'll handle it
          return true;
        },
      });

      const responseTime = Date.now() - startTime;
      const statusCode = response.status;
      const finalUrl =
        response.request?.responseURL || response.config?.url || url;

      let isWorking = false;

      if (statusCode >= 200 && statusCode < 400) {
        if (testType === "standard") {
          // Standard test: just check status code
          isWorking = true;
        } else {
          // Custom test: check if final URL is a product page
          isWorking = this.isProductPage(finalUrl, testType);
          logger.info(
            `Custom test result - Final URL: ${finalUrl}, Is Product Page: ${isWorking}`
          );
        }
      }

      logger.info(
        `${itemType} test result - URL: ${url}, Status: ${statusCode}, Working: ${isWorking}, Time: ${responseTime}ms, Final URL: ${finalUrl}`
      );

      return {
        linkId: itemId,
        url,
        isWorking,
        statusCode,
        responseTime,
        finalUrl,
        testType,
        itemType,
      };
    } catch (error: any) {
      const responseTime = Date.now() - startTime;
      const errorMessage = error.message || "Unknown error";

      logger.error(
        `${itemType} test failed - URL: ${url}, Error: ${errorMessage}, Time: ${responseTime}ms`
      );

      return {
        linkId: itemId,
        url,
        isWorking: false,
        error: errorMessage,
        responseTime,
        testType,
        itemType,
      };
    }
  }

  /**
   * Test a single link (backward compatibility)
   */
  static async testSingleLink(
    linkId: string,
    url: string
  ): Promise<LinkTestResult> {
    return this.testSingleItem(linkId, url, "link");
  }

  /**
   * Test all links and products in the database
   */
  static async testAllLinks(): Promise<LinkTestResult[]> {
    try {
      logger.info("Starting link and product testing job");

      // Get all links and products from database
      const [links, products] = await Promise.all([
        Link.find({}) as Promise<ILink[]>,
        Product.find({}) as Promise<IProduct[]>,
      ]);

      logger.info(
        `Found ${links.length} links and ${products.length} products to test`
      );

      if (links.length === 0 && products.length === 0) {
        logger.info("No links or products found to test");
        return [];
      }

      const results: LinkTestResult[] = [];

      // Test links in batches
      const batchSize = 5;

      // Test links
      for (let i = 0; i < links.length; i += batchSize) {
        const batch = links.slice(i, i + batchSize);

        logger.info(
          `Testing links batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            links.length / batchSize
          )}`
        );

        const batchPromises = batch.map((link) =>
          this.testSingleItem((link._id as any).toString(), link.url, "link")
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches
        if (i + batchSize < links.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Test products
      for (let i = 0; i < products.length; i += batchSize) {
        const batch = products.slice(i, i + batchSize);

        logger.info(
          `Testing products batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(
            products.length / batchSize
          )}`
        );

        const batchPromises = batch.map((product) =>
          this.testSingleItem(
            (product._id as any).toString(),
            product.affiliateUrl,
            "product"
          )
        );

        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        // Add delay between batches
        if (i + batchSize < products.length) {
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
      }

      // Update database with results
      await this.updateItemsStatus(results);

      logger.info(
        `Testing job completed. Tested ${links.length} links and ${products.length} products`
      );
      return results;
    } catch (error) {
      logger.error("Error in testAllLinks:", error);
      throw error;
    }
  }

  /**
   * Test links and products for a specific user
   */
  static async testLinksForUser(userId: string): Promise<LinkTestResult[]> {
    try {
      logger.info(`Starting link and product testing for user: ${userId}`);

      const [links, products] = await Promise.all([
        Link.find({ userId }) as Promise<ILink[]>,
        Product.find({ userId }) as Promise<IProduct[]>,
      ]);

      logger.info(
        `Found ${links.length} links and ${products.length} products for user ${userId}`
      );

      if (links.length === 0 && products.length === 0) {
        return [];
      }

      const results: LinkTestResult[] = [];

      // Test links
      for (const link of links) {
        const result = await this.testSingleItem(
          (link._id as any).toString(),
          link.url,
          "link"
        );
        results.push(result);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      // Test products
      for (const product of products) {
        const result = await this.testSingleItem(
          (product._id as any).toString(),
          product.affiliateUrl,
          "product"
        );
        results.push(result);

        // Small delay between requests
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      await this.updateItemsStatus(results);

      logger.info(
        `Testing completed for user ${userId}. Tested ${links.length} links and ${products.length} products`
      );
      return results;
    } catch (error) {
      logger.error(
        `Error testing links and products for user ${userId}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Update item status in database based on test results
   */
  private static async updateItemsStatus(
    results: LinkTestResult[]
  ): Promise<void> {
    try {
      // Separate results by item type
      const linkResults = results.filter((r) => r.itemType === "link");
      const productResults = results.filter((r) => r.itemType === "product");

      // Update links
      if (linkResults.length > 0) {
        const linkBulkOps = linkResults.map((result) => ({
          updateOne: {
            filter: { _id: result.linkId },
            update: {
              $set: {
                isWorking: result.isWorking,
                isActive: result.isWorking, // Set isActive to false if link is not working
                lastTested: new Date(),
              },
            },
          },
        }));

        const linkBulkResult = await Link.bulkWrite(linkBulkOps);
        logger.info(
          `Updated ${linkBulkResult.modifiedCount} links with test results`
        );

        const linkWorkingCount = linkResults.filter((r) => r.isWorking).length;
        const linkNotWorkingCount = linkResults.filter(
          (r) => !r.isWorking
        ).length;
        logger.info(
          `Link test summary: ${linkWorkingCount} working (active), ${linkNotWorkingCount} not working (deactivated)`
        );
      }

      // Update products
      if (productResults.length > 0) {
        const productBulkOps = productResults.map((result) => ({
          updateOne: {
            filter: { _id: result.linkId },
            update: {
              $set: {
                isWorking: result.isWorking,
                lastTested: new Date(),
              },
            },
          },
        }));

        const productBulkResult = await Product.bulkWrite(productBulkOps);
        logger.info(
          `Updated ${productBulkResult.modifiedCount} products with test results`
        );

        const productWorkingCount = productResults.filter(
          (r) => r.isWorking
        ).length;
        const productNotWorkingCount = productResults.filter(
          (r) => !r.isWorking
        ).length;
        logger.info(
          `Product test summary: ${productWorkingCount} working, ${productNotWorkingCount} not working`
        );
      }
    } catch (error) {
      logger.error("Error updating item status in database:", error);
      throw error;
    }
  }

  /**
   * Update link status in database based on test results (backward compatibility)
   */
  private static async updateLinksStatus(
    results: LinkTestResult[]
  ): Promise<void> {
    return this.updateItemsStatus(results);
  }

  /**
   * Get statistics about link and product testing
   */
  static async getLinkTestStats(): Promise<{
    links: {
      total: number;
      working: number;
      notWorking: number;
      lastTested?: Date;
    };
    products: {
      total: number;
      working: number;
      notWorking: number;
      lastTested?: Date;
    };
  }> {
    try {
      // Link statistics
      const linkTotal = await Link.countDocuments({});
      const linkWorking = await Link.countDocuments({ isWorking: true });
      const linkNotWorking = await Link.countDocuments({ isWorking: false });

      const recentLink = await Link.findOne({ lastTested: { $exists: true } })
        .sort({ lastTested: -1 })
        .select("lastTested");

      // Product statistics
      const productTotal = await Product.countDocuments({});
      const productWorking = await Product.countDocuments({ isWorking: true });
      const productNotWorking = await Product.countDocuments({
        isWorking: false,
      });

      const recentProduct = await Product.findOne({
        lastTested: { $exists: true },
      })
        .sort({ lastTested: -1 })
        .select("lastTested");

      return {
        links: {
          total: linkTotal,
          working: linkWorking,
          notWorking: linkNotWorking,
          lastTested: recentLink?.lastTested,
        },
        products: {
          total: productTotal,
          working: productWorking,
          notWorking: productNotWorking,
          lastTested: recentProduct?.lastTested,
        },
      };
    } catch (error) {
      logger.error("Error getting link and product test stats:", error);
      throw error;
    }
  }
}

/**
 * Cron job function to test all links
 */
export async function runLinkTestingJob(): Promise<void> {
  try {
    logger.info("Starting scheduled link testing job");
    await LinkTester.testAllLinks();
    logger.info("Scheduled link testing job completed successfully");
  } catch (error) {
    logger.error("Scheduled link testing job failed:", error);
  }
}
