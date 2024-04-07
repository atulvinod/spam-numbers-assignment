import './pre-start'; // Must be the first import
import logger from 'jet-logger';

import EnvVars from '@src/constants/envVars';
import server from './server';


// **** Run **** //

const SERVER_START_MSG = ('Express server started on port: ' + 
  EnvVars.port.toString());
console.log(SERVER_START_MSG);
server.listen(EnvVars.port, () => logger.info(SERVER_START_MSG));
