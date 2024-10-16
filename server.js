import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(path.join(__dirname, '../public')));

// Serve header and footer partials
app.get('/partials/header.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/partials/header.html'));
});

app.get('/partials/footer.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/partials/footer.html'));
});

// Serve main pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Example for another page
app.get('/about.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/about.html'));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
