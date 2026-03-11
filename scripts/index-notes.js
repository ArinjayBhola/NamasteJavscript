const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, '..');
const dataDir = path.join(baseDir, 'public', 'data');

if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

function getFiles(dir) {
    if (!fs.existsSync(dir)) return [];
    return fs.readdirSync(dir).filter(file => fs.statSync(path.join(dir, file)).isFile());
}

function toDataUrl(filePath) {
    const ext = path.extname(filePath).toLowerCase().replace('.', '');
    const mimeMap = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', svg: 'image/svg+xml' };
    const mime = mimeMap[ext] || 'image/png';
    const data = fs.readFileSync(filePath).toString('base64');
    return `data:${mime};base64,${data}`;
}

function indexNotes() {
    const episodes = [];
    const entries = fs.readdirSync(baseDir);
    const seasonDirs = entries.filter(f => {
        const fp = path.join(baseDir, f);
        return fs.statSync(fp).isDirectory() && /^S\d+ Ep \d+$/.test(f);
    });

    seasonDirs.forEach(seasonDir => {
        const seasonPath = path.join(baseDir, seasonDir);
        const files = getFiles(seasonPath);

        // Read notes content directly
        const notesTxt = files.find(f => f === 'index.txt');
        const notesContent = notesTxt ? fs.readFileSync(path.join(seasonPath, notesTxt), 'utf-8') : null;

        // Read code content
        const codeFile = files.find(f => f === 'index.js');
        const codeContent = codeFile ? fs.readFileSync(path.join(seasonPath, codeFile), 'utf-8') : null;

        // Embed images as base64 data URLs
        const imageFiles = files.filter(f => f.match(/\.(png|jpg|jpeg|gif|svg)$/i));
        const diagrams = imageFiles.map(f => ({
            name: f,
            dataUrl: toDataUrl(path.join(seasonPath, f))
        }));

        // Read embedded HTML (for code-demo episodes)
        const htmlFile = files.find(f => f === 'index.html');
        const hasHtml = !!htmlFile;

        const episode = {
            id: seasonDir,
            title: seasonDir,
            notes: notesContent,
            code: codeContent,
            diagrams,
            hasHtml
        };

        episodes.push(episode);
    });

    // Sort: S1 Ep 1, S1 Ep 2... S2 Ep 1...
    episodes.sort((a, b) => {
        const parse = (id) => {
            const match = id.match(/S(\d+) Ep (\d+)/);
            return match ? { s: parseInt(match[1]), e: parseInt(match[2]) } : { s: 0, e: 0 };
        };
        const aa = parse(a.id);
        const bb = parse(b.id);
        return aa.s !== bb.s ? aa.s - bb.s : aa.e - bb.e;
    });

    fs.writeFileSync(path.join(dataDir, 'episodes.json'), JSON.stringify(episodes, null, 2));
    console.log(`✓ Indexed ${episodes.length} episodes to public/data/episodes.json`);
    episodes.forEach(ep => {
        console.log(` - ${ep.id.padEnd(12)} | notes:${ep.notes ? '✓' : '✗'} code:${ep.code ? '✓' : '✗'} diagrams:${ep.diagrams.length}`);
    });
    
    const sizeKb = Math.round(fs.statSync(path.join(dataDir, 'episodes.json')).size / 1024);
    console.log(`\nTotal size: ${sizeKb} KB`);
}

indexNotes();
