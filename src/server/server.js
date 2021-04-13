const express = require('express');
const session = require('express-session');
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


class DbObject {
  constructor(tablename, fieldnames) {
    this.tablename = tablename;
    this.fieldnames = fieldnames;
  }

  // all(callback) {
  //   db.all(`SELECT ${this.fieldnames.join(', ')} FROM ${this.tablename}`, (_, rows) => callback(rows));
  // }

  filter(filters, callback) {
    let keys = [];
    let values = [];
    Object.entries(filters).forEach(item => { keys.push(item[0]); values.push(item[1]) });

    const stmt = db.prepare(`SELECT ${this.fieldnames.join(', ')} FROM ${this.tablename} WHERE ${keys.map(f=> `${f} = ?`)}`);
    stmt.run(values).all((_, r) => callback(r));
    stmt.finalize();
  }
}

const Files = new DbObject('files', ['id', 'slug', 'name']);


app.use(fileUpload());
app.use(express.urlencoded({extended: true}));
app.use(session({secret: 'test', resave: true, saveUninitialized: true, cookie: { maxAge: 60000 }}));

// Frontend
app.get('/', (req, res) => {
  if (req.session.user === 'user') {
    res.sendFile(path.join(__dirname, '../../public/index.html'));
  } else {
    res.redirect('/login')
  }
})

// app.get('/download/', (_, res) => {
//   Files.all((arg) => res.json(arg));
// });

app.get('/download/:slug', (req, res) => {
  const callback = (rows) => {
    res.download(`${process.env.UPLOAD_PATH}${rows[0].slug}`, rows[0].name);
  }
  Files.filter({slug: req.params.slug}, callback);
});

app.get('/login', (_, res) => {
  res.sendFile(path.join(__dirname, '../../public/login.html'))
});

app.post('/login', (req, res) => {
  if (req.body.password === process.env.PASSWORD) {
    req.session.user = 'user';
    res.redirect('/')
  } else {
    res.redirect('/login')
  }
});

// Api
app.post('/api/files/', (req, res) => {
  if (!req.session.user) {
    res.sendStatus(403);
  } else {
    const slug = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    req.files.file.mv(`${process.env.UPLOAD_PATH}${slug}`)

    const stmt = db.prepare('INSERT INTO files (id, slug, name) VALUES (null, ? ,?)');
    stmt.run(slug, req.files.file.name);
    stmt.finalize();
    res.json({ success: true, slug: slug });
  }
});

// Static stuff
app.use(express.static(path.join(__dirname, '../../public')));

// Fallback route
app.get('*', (req, res) => {
  if (!req.session.user) {
    res.redirect('/login');
  } else {
    res.sendFile(path.join(__dirname, '../../public/index.html'))

  }
});

http.listen(3000, () => {
  console.log('listening on http://localhost:3000');
})
