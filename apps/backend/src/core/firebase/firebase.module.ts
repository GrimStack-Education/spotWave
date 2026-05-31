import { Global, Module } from '@nestjs/common';
import { FirebaseAdminService } from './firebase-admin.service';
import { FirestoreMapper } from './firestore.mapper';

@Global()
@Module({
  providers: [FirebaseAdminService, FirestoreMapper],
  exports: [FirebaseAdminService, FirestoreMapper],
})
export class FirebaseModule {}
