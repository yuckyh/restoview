'use strict';

import app from './app.js';
import compileSCSS from './sass.js';

app.listen(parseInt(process.env.APP_PORT), async () => {
  try {
    console.log('Server running :3');
    console.log('Compiling SCSS...');
    await compileSCSS();
    console.log('Connecting to DB');
    await import('./db.js');
    console.log('Loading Routes');
    await import('./routes.js');
    console.log('Server done loading :D');
  } catch (e) {
    console.error(e);
  }
});
