import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';
import winston from 'winston';

// Set up Winston logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.simple(),
  transports: [new winston.transports.Console()],
});

const prisma = new PrismaClient();

(async () => {
  let browser;
  try {
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    await page.setUserAgent('ghost/1.0 (+https://muchandy.de)');
    const url = 'https://www.smartphonereparatur-muenchen.de/';
    await page.goto(url, { waitUntil: 'networkidle2' });
    logger.info(`Navigated to ${url}`);

    await page.waitForSelector('.calculator-wrapper', { timeout: 5000 });
    logger.info('Calculator form loaded');

    const manufacturerOptions = await page.evaluate(() => {
      const select = document.querySelector('#manufacturer');
      return Array.from(select.options)
        .filter((option) => option.value)
        .map((option) => ({
          value: option.value,
          text: option.textContent.trim(),
        }));
    });

    logger.info(`Extracted ${manufacturerOptions.length} manufacturers`);

    for (const manufacturer of manufacturerOptions) {
      // Upsert manufacturer
      const manufacturerRecord = await prisma.manufacturer.upsert({
        where: { name: manufacturer.text },
        update: {},
        create: { name: manufacturer.text },
      });
      logger.info(`Selected manufacturer: ${manufacturer.text}`);

      await page.select('#manufacturer', manufacturer.value);
      await page.waitForFunction(
        () => document.querySelector('#device').options.length > 1,
        { timeout: 5000 }
      );

      const deviceOptions = await page.evaluate(() => {
        const select = document.querySelector('#device');
        return Array.from(select.options)
          .filter((option) => option.value)
          .map((option) => ({
            value: option.value,
            text: option.textContent.trim(),
          }));
      });

      logger.info(
        `Extracted ${deviceOptions.length} devices for manufacturer ${manufacturer.text}`
      );

      for (const device of deviceOptions) {
        let deviceRecord = await prisma.device.findFirst({
          where: {
            name: device.text,
            manufacturerId: manufacturerRecord.id,
          },
        });

        if (!deviceRecord) {
          deviceRecord = await prisma.device.create({
            data: {
              name: device.text,
              manufacturerId: manufacturerRecord.id,
            },
          });
        }

        logger.info(`Selected device: ${device.text}`);
        await page.select('#device', device.value);
        await page.waitForFunction(
          () => document.querySelector('#action').options.length > 1,
          { timeout: 5000 }
        );

        const actionOptions = await page.evaluate(() => {
          const select = document.querySelector('#action');
          return Array.from(select.options)
            .filter((option) => option.value)
            .map((option) => ({
              value: option.value,
              text: option.textContent.trim(),
            }));
        });

        logger.info(
          `Extracted ${actionOptions.length} actions for device ${device.text}`
        );

        for (const action of actionOptions) {
          let actionRecord = await prisma.action.findFirst({
            where: {
              name: action.text,
              deviceId: deviceRecord.id,
            },
          });

          if (!actionRecord) {
            actionRecord = await prisma.action.create({
              data: {
                name: action.text,
                deviceId: deviceRecord.id,
              },
            });
          }

          logger.info(`Selected action: ${action.text}`);
          await page.select('#action', action.value);

          await page.waitForFunction(
            () => {
              const priceElement = document.querySelector('#final-price');
              return priceElement && priceElement.textContent.trim() !== '';
            },
            { timeout: 5000 }
          );

          let priceText = await page.evaluate(() => {
            const priceElement = document.querySelector('#final-price');
            return priceElement
              ? priceElement.textContent.trim()
              : 'Price not available';
          });

          const priceNumber = extractPriceNumber(priceText);

          logger.info(`Processed Price: ${priceNumber}`);

          try {
            await prisma.price.create({
              data: {
                actionId: actionRecord.id,
                price: priceNumber,
                dateCollected: new Date(),
              },
            });
          } catch (error) {
            logger.error(
              `Error saving price for action: ${action.text} on device: ${device.text}`,
              error
            );
          }

          await delay(1000); // Rate limiting
        }
      }
    }

    await browser.close();
    await prisma.$disconnect();
    logger.info('Browser and database connections closed');
  } catch (error) {
    logger.error('An error occurred:', error);
    if (browser) await browser.close();
    await prisma.$disconnect();
  }
})();

function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function extractPriceNumber(priceText) {
  if (!priceText || priceText.toLowerCase().includes('not available')) {
    return null;
  }
  const price = priceText.replace(/\D/g, '');
  const priceNumber = parseInt(price, 10);
  return isNaN(priceNumber) ? null : priceNumber;
}
