import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { PrismaClient } from '@prisma/client'; // Import Prisma Client

const prisma = new PrismaClient();
const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files (CSS, images, JS) from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Log requests for static files
app.use((req, res, next) => {
  console.log(`Requested URL: ${req.originalUrl}`);
  next();
});

// --- API ROUTES ---

// API endpoint to get all manufacturers
app.get('/api/manufacturers', async (req, res) => {
  try {
    const manufacturers = await prisma.manufacturer.findMany({
      include: {
        devices: true, // Include associated devices
      },
    });
    res.json(manufacturers);
  } catch (error) {
    console.error('Error fetching manufacturers:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get devices by manufacturer ID
app.get('/api/manufacturers/:id/devices', async (req, res) => {
  const manufacturerId = parseInt(req.params.id, 10);
  console.log(`Fetching devices for manufacturer ID: ${manufacturerId}`);
  try {
    const devices = await prisma.device.findMany({
      where: {
        manufacturerId: manufacturerId,
      },
    });
    console.log(`Devices found for manufacturer ${manufacturerId}:`, devices);
    if (devices.length > 0) {
      res.json(devices);
    } else {
      console.log('No devices found');
      res.status(404).json({ error: 'Devices not found' });
    }
  } catch (error) {
    console.error('Error fetching devices:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get actions by device ID
app.get('/api/devices/:id/actions', async (req, res) => {
  const deviceId = parseInt(req.params.id, 10);
  console.log(`Fetching actions for device ID: ${deviceId}`);
  try {
    const actions = await prisma.action.findMany({
      where: {
        deviceId: deviceId,
      },
    });
    console.log(`Actions found for device ${deviceId}:`, actions);
    if (actions.length > 0) {
      res.json(actions);
    } else {
      console.log('No actions found');
      res.status(404).json({ error: 'Actions not found' });
    }
  } catch (error) {
    console.error('Error fetching actions:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// API endpoint to get price by action ID
app.get('/api/actions/:id/price', async (req, res) => {
  const actionId = parseInt(req.params.id, 10);
  console.log(`Fetching price for action ID: ${actionId}`);
  try {
    const priceRecord = await prisma.price.findFirst({
      where: { actionId: actionId },
    });
    if (priceRecord) {
      console.log(`Price found for action ${actionId}:`, priceRecord);
      res.json({ price: priceRecord.price });
    } else {
      console.log('No price found');
      res.status(404).json({ error: 'Price not found' });
    }
  } catch (error) {
    console.error('Error fetching price:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// --- PAGE ROUTES ---

// Function to inject content into the layout
function renderPageWithLayout(pageContent, callback) {
  const layoutPath = path.join(__dirname, 'public/index.html');
  fs.readFile(layoutPath, 'utf8', (err, layout) => {
    if (err) {
      return callback(err);
    }
    // Inject the page content into the layout (replace placeholder)
    const renderedPage = layout.replace(
      '<div id="content-placeholder"></div>',
      `<div id="content-placeholder">${pageContent}</div>`
    );
    callback(null, renderedPage);
  });
}

// Handle both "/" and "/index" as the home page
app.get(['/', '/index'], (req, res) => {
  fs.readFile(
    path.join(__dirname, 'public/pages/index.html'),
    'utf8',
    (err, content) => {
      if (err) {
        return res.status(404).send('Seite nicht gefunden');
      }
      renderPageWithLayout(content, (err, page) => {
        if (err) {
          return res.status(500).send('Internal Server Error');
        }
        res.send(page);
      });
    }
  );
});

// Serve clean URLs without .html extension
app.get('/:page', (req, res) => {
  const page = req.params.page;
  const filePath = path.join(__dirname, `public/pages/${page}.html`);

  // Check if the file exists
  fs.readFile(filePath, 'utf8', (err, content) => {
    if (err) {
      // Serve custom 404 page within the main layout
      fs.readFile(
        path.join(__dirname, 'public/pages/404.html'),
        'utf8',
        (err, errorContent) => {
          if (err) {
            return res.status(500).send('Internal Server Error');
          }
          renderPageWithLayout(errorContent, (err, page) => {
            if (err) {
              return res.status(500).send('Internal Server Error');
            }
            res.send(page);
          });
        }
      );
      return;
    }
    renderPageWithLayout(content, (err, page) => {
      if (err) {
        return res.status(500).send('Internal Server Error');
      }
      res.send(page);
    });
  });
});

// Start the server on port 3000 or the defined environment port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
