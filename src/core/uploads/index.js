import UploadRouter from './routes';
import { processRequest, apolloUploadKoa, apolloUploadExpress } from './ApolloUpload';

export default UploadRouter;
export {
  processRequest,
  apolloUploadKoa,
  apolloUploadExpress,
};
