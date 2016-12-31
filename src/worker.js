import concat from 'concat-stream';
import MySql from 'then-mysql';
import Promise from 'promise';

function respond(data) {
  process.stdout.write(JSON.stringify(data), () => {
    process.exit(0);
  });
}

process.stdin.pipe(concat((stdin) => {
  const req = JSON.parse(stdin.toString());

  const db = new MySql({
    ...req.config,
    connectionLimit: 1,
  });

  Promise.resolve(null).then(() => {
    return db[req.method](...req.args);
  }).finally(result => {
    return db.dispose();
  }).done(result => {
    respond({success: true, result});
  }, err => {
    respond({success: false, error: err.message});
  });
}));
