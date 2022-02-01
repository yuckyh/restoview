import sass from 'sass';
import fs from 'fs';

const compileSCSS = async () => {
  if (process.env.MODE === 'prod') return console.log('production mode');

  const result = await sass.compileAsync('./scss/style.scss', {
    style: 'compressed',
    logger: sass.Logger.silent,
  });

  fs.writeFileSync('./public/css/materialize.min.css', result.css);
};

export default compileSCSS;
