const fs = require('fs');

const sqlite3 = require('sqlite3').verbose();


const migrations = fs.readdirSync(__dirname + '/dbversions/').map(f => {
    const data = fs.readFileSync(`${__dirname}/dbversions/${f}`, 'utf8');
    return [f, data];
});


const db = new sqlite3.Database(process.env.DB_PATH);

db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS migrations (name TEXT)");
    migrations.forEach(([name, migration]) => {
        db.all(`SELECT name FROM migrations WHERE name = '${name}'`, (error, result) => {
            if (result.length === 0) {
                db.run(migration);
                db.run(`INSERT INTO migrations VALUES ('${name}')`);
                console.log(`\x1b[32m ${name}: Migrated`)
            } else {
                console.log(`${name}: Already in DB`)
            }
        });
    })
});
