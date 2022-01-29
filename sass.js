import sass from 'sass';
import fs from 'fs';
import { resolvePath } from './utils.js';

const compileSCSS = async () => {
  const result = await sass.compileAsync('./scss/style.scss', {
    style: 'compressed',
    logger: sass.Logger.silent,
  });

  fs.writeFileSync(
    resolvePath(import.meta.url, './public/css/materialize.min.css'),
    result.css
  );
};

export default compileSCSS;
