import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const newEvents = [
  { id: 'founder-fridays', url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'investor-connect', url: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'pitch-nexus', url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'build-weekend', url: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'startup-sprint', url: 'https://images.unsplash.com/photo-1551434678-e076c223a692?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'innovation-lab', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'demo-day', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1024&h=576&fit=crop', ext: 'jpg' },
];

const outDir = path.join(process.cwd(), 'public/images/events');

function download(url, dest) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const file = fs.createWriteStream(dest);
    client.get(url, (res) => {
      if (res.statusCode !== 200) { reject(new Error(`Status ${res.statusCode}`)); return; }
      res.pipe(file);
      file.on('finish', () => file.close(resolve));
    }).on('error', (err) => { fs.unlink(dest, () => {}); reject(err); });
  });
}

async function main() {
  fs.mkdirSync(outDir, { recursive: true });

  console.log('Downloading new event images...');
  for (const evt of newEvents) {
    const dest = path.join(outDir, `${evt.id}.${evt.ext}`);
    console.log(`  ${evt.id}...`);
    try {
      await download(evt.url, dest);
      console.log(`    ✓`);
    } catch (e) {
      console.error(`    ✗ ${e.message}`);
    }
  }
  console.log('\nDone!');
}

main();