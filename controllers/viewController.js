import fs from 'fs';
import { resolvePath } from '../utils.js';

const restaurants = (req, res) => {
  const html = fs
    .readFileSync(resolvePath(import.meta.url, '../public/restaurant.html'))
    .toString('utf-8');

  res.set('Content-Type', 'text/html').end(html);
};

export default { restaurants };
