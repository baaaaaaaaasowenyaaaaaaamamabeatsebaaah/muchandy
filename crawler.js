import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

(async () => {
  let browser;
  try {
    // Launch Puppeteer
    browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();

    // Set a custom User-Agent
    await page.setUserAgent('ghost/1.0 (+https://muchandy.de)');

    // Navigate to the website
    const url = 'https://www.smartphonereparatur-muenchen.de/';
    await page.goto(url, { waitUntil: 'networkidle2' });
    console.log(`Navigated to ${url}`);

    // Wait for the calculator form to load
    await page.waitForSelector('.calculator-wrapper', { timeout: 5000 });
    console.log('Calculator form loaded');

    // Extract manufacturer options
    const manufacturerOptions = await page.evaluate(() => {
      const select = document.querySelector('#manufacturer');
      return Array.from(select.options)
        .filter((option) => option.value)
        .map((option) => ({
          value: option.value,
          text: option.textContent.trim(),
        }));
    });

    console.log(`Extracted ${manufacturerOptions.length} manufacturers`);

    for (const manufacturer of manufacturerOptions) {
      // Select manufacturer
      await page.select('#manufacturer', manufacturer.value);
      console.log(`Selected manufacturer: ${manufacturer.text}`);

      // Wait for device options to update
      await page.waitForFunction(
        () => document.querySelector('#device').options.length > 1,
        { timeout: 5000 }
      );
      await delay(500);

      // Extract device options
      const deviceOptions = await page.evaluate(() => {
        const select = document.querySelector('#device');
        return Array.from(select.options)
          .filter((option) => option.value)
          .map((option) => ({
            value: option.value,
            text: option.textContent.trim(),
          }));
      });

      console.log(
        `Extracted ${deviceOptions.length} devices for manufacturer ${manufacturer.text}`
      );

      for (const device of deviceOptions) {
        // Select device
        await page.select('#device', device.value);
        console.log(`  Selected device: ${device.text}`);

        // Wait for action options to update
        await page.waitForFunction(
          () => document.querySelector('#action').options.length > 1,
          { timeout: 5000 }
        );
        await delay(500);

        // Extract action options
        const actionOptions = await page.evaluate(() => {
          const select = document.querySelector('#action');
          return Array.from(select.options)
            .filter((option) => option.value)
            .map((option) => ({
              value: option.value,
              text: option.textContent.trim(),
            }));
        });

        console.log(
          `    Extracted ${actionOptions.length} actions for device ${device.text}`
        );

        for (const action of actionOptions) {
          // Select action
          await page.select('#action', action.value);
          console.log(`      Selected action: ${action.text}`);

          // Wait for price to update
          await page.waitForFunction(
            () => {
              const priceElement = document.querySelector('#final-price');
              return priceElement && priceElement.textContent.trim() !== '';
            },
            { timeout: 5000 }
          );
          await delay(500);

          // Extract price
          let priceText = await page.evaluate(() => {
            const priceElement = document.querySelector('#final-price');
            return priceElement
              ? priceElement.textContent.trim()
              : 'Price not available';
          });

          console.log(`        Raw Price: ${priceText}`);

          // Process price to extract only the integer value
          const priceNumber = extractPriceNumber(priceText);

          console.log(`        Processed Price: ${priceNumber}`);

          // Insert into the database using Prisma
          const dateCollected = new Date();
          try {
            await prisma.price.create({
              data: {
                manufacturer: manufacturer.text,
                device: device.text,
                action: action.text,
                price: priceNumber, // Now an integer
                dateCollected: dateCollected,
              },
            });
          } catch (dbError) {
            // Handle unique constraint violation (skip duplicates)
            if (dbError.code === 'P2002') {
              console.log('        Duplicate entry, skipping');
            } else {
              console.error('        Database error:', dbError);
            }
          }

          // Rate limiting
          await delay(1000);
        }
      }
    }

    // Close the browser and Prisma client
    await browser.close();
    await prisma.$disconnect();
    console.log('Browser and database connections closed');
  } catch (error) {
    console.error('An error occurred:', error);
    if (browser) {
      await browser.close();
      console.log('Browser closed due to error');
    }
    await prisma.$disconnect();
  }
})();

// Delay function
function delay(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

// Function to extract only the integer value from the price string
function extractPriceNumber(priceText) {
  if (!priceText || priceText.toLowerCase().includes('not available')) {
    return null;
  }

  // Remove all non-digit characters
  const price = priceText.replace(/\D/g, '');

  // Parse the price as an integer
  const priceNumber = parseInt(price, 10);
  return isNaN(priceNumber) ? null : priceNumber;
}
