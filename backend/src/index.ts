import express from 'express';
import cors from 'cors';
import {MongoClient} from 'mongodb'
import {spawn} from "child_process";

const app = express();
app.use(cors());
app.use(express.json());

app.get('/api/hello', (req, res) => {
    res.json({ message: 'Hello from Express + TypeScript!' });
});

app.post('/api/all-collections', async (req, res) => {
    try {
        const uri = `mongodb://${req.body.MONGODB_USER}:${req.body.MONGODB_PASS}@${req.body.MONGODB_HOST}:${req.body.MONGODB_PORT}/${req.body.MONGODB_DB}?authSource=${req.body.MONGODB_DB_AUTH}`
        const client = new MongoClient(uri)
        await client.connect().then(()=>{
            console.debug(`Connected to MongoDB`);
        });
        const db = client.db(req.body.MONGODB_DB);
        const collections = await db.listCollections().toArray();
        const cols= collections.map((col) => col.name)
        res.json({ data:cols??[] });
    }catch (e) {
        res.json({ data:[] });
    }
});


app.post('/api/dump', async (req, res) => {
    if (req.body.selects && Array.isArray(req.body.selects)&&req.body.selects.length > 0) {
        for (const col of req.body.selects) {
            if (col) {
                await new Promise<void>((resolve, reject) => {
                    // สร้างโปรเซส mongodump พร้อมอาร์กิวเมนต์
                    const backupProcess = spawn('mongodump', [
                        '--gzip',
                        `--uri="mongodb://${req.body.MONGODB_USER}:${req.body.MONGODB_PASS}@${req.body.MONGODB_HOST}:${req.body.MONGODB_PORT}/${req.body.MONGODB_DB}?authSource=${req.body.MONGODB_DB_AUTH}"`,
                        `--collection=${col}`,
                        `--out=${req.body.folder}` // ใช้โฟลเดอร์ที่ส่งมาจาก client
                    ]);

                    backupProcess.stdout.on('data', (data) => {
                        console.log(`stdout: ${data}`);
                    });

                    backupProcess.stderr.on('data', (data) => {
                        console.error(`stderr: ${data}`);
                    });

                    backupProcess.on('exit', (code, signal) => {
                        if (code) {
                            console.error('mongodump จบการทำงานพร้อมรหัส exit code = ' + code);
                        } else if (signal) {
                            console.error('mongodump ถูกหยุดด้วยสัญญาณ = ' + signal);
                        } else {
                            console.log(`dump ${col} finished`);
                        }
                        resolve()

                    });
                })
            }
        }

        console.log('All selected collections have been dumped successfully.');

    }else {

        const backupProcess = spawn('mongodump', [
            '--gzip',
            `--uri="mongodb://${req.body.MONGODB_USER}:${req.body.MONGODB_PASS}@${req.body.MONGODB_HOST}:${req.body.MONGODB_PORT}/${req.body.MONGODB_DB}?authSource=${req.body.MONGODB_DB_AUTH}"`,
            `--out=${req.body.folder}` // ใช้โฟลเดอร์ที่ส่งมาจาก client
        ]);

        backupProcess.stdout.on('data', (data) => {
            console.log(`stdout: ${data}`);
        });

        backupProcess.stderr.on('data', (data) => {
            console.error(`stderr: ${data}`);
        });

        backupProcess.on('exit', (code, signal) => {
            if (code) {
                console.error('mongodump จบการทำงานพร้อมรหัส exit code = ' + code);
            } else if (signal) {
                console.error('mongodump ถูกหยุดด้วยสัญญาณ = ' + signal);
            } else {
                console.log('dump finished');
            }
        });

    }

    res.json({ data:[] });
});


app.post('/api/restore', async (req, res) => {


    if (req.body.MONGODB_HOST.includes('203')){
        res.status(400).send({})
        return;
    }
    const restoreProcess = spawn('mongorestore', [
        `--uri="mongodb://${req.body.MONGODB_USER}:${req.body.MONGODB_PASS}@${req.body.MONGODB_HOST}:${req.body.MONGODB_PORT}/${req.body.MONGODB_DB}?authSource=${req.body.MONGODB_DB_AUTH}"`,
        `${req.body.folder}/`,
        '--gzip',
        '--drop',

    ]);
    //
    restoreProcess.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    restoreProcess.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
    });

    restoreProcess.on('exit', (code, signal) => {
        if (code) {
            console.error('mongorestore จบการทำงานพร้อมรหัส exit code = ' + code);
        } else if (signal) {
            console.error('mongorestore ถูกหยุดด้วยสัญญาณ = ' + signal);
        } else {
            console.log('restore finished');
        }
    });

    res.json({ data:[] });

});


app.listen(4000, () => {
    console.log('🚀 Server listening on http://localhost:4000');
});
