import fs from 'fs';
import path from 'path';
import https from 'https';
import http from 'http';

/* Professional headshots of students in suits from Unsplash */
const teamHeadshots = [
  { id: 'member-1', url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-2', url: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-3', url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-4', url: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-5', url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-6', url: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-7', url: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-8', url: 'https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-9', url: 'https://images.unsplash.com/photo-1552058544-f2b08422138a?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-10', url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-11', url: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
  { id: 'member-12', url: 'https://images.unsplash.com/photo-1531427186611-ecfd6d936c79?w=400&h=400&fit=crop&crop=face', ext: 'jpg' },
];

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
  fs.mkdirSync(outDirTeam, { recursive: true });

  console.log('Downloading team headshots...');
  for (const mem of teamHeadshots) {
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