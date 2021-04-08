const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const http = require('http').createServer(app);
const path = require('path');
const { exit } = require('process');

if (!process.env.UPLOAD_PATH || !process.env.DB_PATH ) {
  console.log('Please provide DB_PATH and UPLOAD_PATH')
  exit(1)
}

const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database(process.env.DB_PATH);

app.use(fileUpload());

// Static stuff
app.use(express.static(path.join(__dirname, '../../public')));

// Api
app.get('/download/:slug', (req, res) => {
  const stmt = db.prepare('SELECT slug, name FROM files WHERE slug = ?');
  stmt.run(req.params.slug).each((_, r) => res.download(`${process.env.UPLOAD_PATH}${r.slug}`, r.name));
  stmt.finalize();
});

app.post('/api/files/', (req, res) => {
  const slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  req.files.file.mv(`${process.env.UPLOAD_PATH}${slug}`)

  const stmt = db.prepare('INSERT INTO files (id, slug, name) VALUES (null, ? ,?)');
  stmt.run(slug, req.files.file.name);
  stmt.finalize();

  res.json({ success: true, slug: slug });
});

// Fallback route
app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../../public/index.html')));

http.listen(3000, () => {
  console.log('listening on http://localhost:3000');
})
