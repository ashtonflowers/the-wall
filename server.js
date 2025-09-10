const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const multer = require('multer');

const app = express();
const port = 3000;

const dbFile = 'database.sqlite';
const db = new sqlite3.Database(dbFile);

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Database initialization
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS designs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            grid_size TEXT NOT NULL,
            border_color TEXT,
            sashing_color TEXT,
            backing_color TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS images (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            design_id INTEGER,
            grid_position INTEGER NOT NULL, -- 1 for available, 2 for main grid
            image_path TEXT NOT NULL,
            item_order INTEGER NOT NULL,
            FOREIGN KEY (design_id) REFERENCES designs(id)
        )
    `);
});

// Multer storage configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/')
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
    }
});

const upload = multer({ storage: storage });

// Image upload endpoint
app.post('/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).send({ error: 'No file uploaded.' });
    }
    res.send({ filePath: `/uploads/${req.file.filename}` });
});

// Save design endpoint
app.post('/designs', (req, res) => {
    const { gridSize, bordering, sashing, backing, grid1, grid2 } = req.body;

    const sql = `INSERT INTO designs (grid_size, border_color, sashing_color, backing_color) VALUES (?, ?, ?, ?)`;
    db.run(sql, [gridSize, bordering, sashing, backing], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        const designId = this.lastID;
        const imgSql = `INSERT INTO images (design_id, grid_position, image_path, item_order) VALUES (?, ?, ?, ?)`;

        const imagePromises = [];
        grid1.forEach((imgPath, index) => {
            imagePromises.push(new Promise((resolve, reject) => {
                db.run(imgSql, [designId, 1, imgPath, index], (err) => err ? reject(err) : resolve());
            }));
        });
        grid2.forEach((imgPath, index) => {
            imagePromises.push(new Promise((resolve, reject) => {
                db.run(imgSql, [designId, 2, imgPath, index], (err) => err ? reject(err) : resolve());
            }));
        });

        Promise.all(imagePromises)
            .then(() => res.status(201).json({ id: designId }))
            .catch(err => res.status(500).json({ error: err.message }));
    });
});

// Load design endpoint
app.get('/designs/:id', (req, res) => {
    const { id } = req.params;
    const designSql = `SELECT * FROM designs WHERE id = ?`;
    db.get(designSql, [id], (err, design) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!design) {
            return res.status(404).json({ error: 'Design not found' });
        }

        const imagesSql = `SELECT * FROM images WHERE design_id = ? ORDER BY item_order ASC`;
        db.all(imagesSql, [id], (err, images) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            const response = {
                ...design,
                grid1: images.filter(img => img.grid_position === 1).map(img => img.image_path),
                grid2: images.filter(img => img.grid_position === 2).map(img => img.image_path)
            };
            res.json(response);
        });
    });
});


app.get('/', (req, res) => {
    res.send('Jersey Blanket Customizer Server is running!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
