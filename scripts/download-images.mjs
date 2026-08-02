import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

const eventImages = [
  { id: 'tech-tuesday-genai-08', url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'data-dash-hackathon-09', url: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'cto-fireside-08', url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'av-workshop-08', url: 'https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'gaming-night-08', url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'orientation-support-08', url: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1024&h=576&fit=crop', ext: 'jpg' },
  { id: 'infra-deepdive-09', url: 'https://images.unsplash.com/photo-1518432031352-d6fc5c10da5a?w=1024&h=576&fit=crop', ext: 'jpg' },
];

const teamImages = [
  { id: 'member-1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-2', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-4', url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-6', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
];

const outDirEvents = path.join(process.cwd(), 'public/images/events');
const outDirTeam = path.join(process.cwd(), 'public/images/team');

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
  fs.mkdirSync(outDirEvents, { recursive: true });
  fs.mkdirSync(outDirTeam, { recursive: true });

  console.log('Downloading event images...');
  for (const evt of eventImages) {
    const dest = path.join(outDirEvents, `${evt.id}.${evt.ext}`);
    console.log(`  ${evt.id}...`);
    try {
      await download(evt.url, dest);
      console.log(`    ✓`);
    } catch (e) {
      console.error(`    ✗ ${e.message}`);
    }
  }

  console.log('\nDownloading team images...');
  for (const mem of teamImages) {
    const dest = path.join(outDirTeam, `${mem.id}.${mem.ext}`);
    console.log(`  ${mem.id}...`);
    try {
      await download(mem.url, dest);
      console.log(`    ✓`);
    } catch (e) {
      console.error(`    ✗ ${e.message}`);
    }
  }
  console.log('\nDone!');
}

main();