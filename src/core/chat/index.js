import serviceChatFactory, { FirebaseProvider } from './services';
import config from '../../config';

export default serviceChatFactory.createClient(FirebaseProvider, config.auth.firebase);
