import serviceChatFactory, { FirebaseProvider } from './services';
import { auth } from '../../config';

export default serviceChatFactory.createClient(FirebaseProvider, auth.firebase);
