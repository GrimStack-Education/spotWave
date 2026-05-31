import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  App,
  AppOptions,
  cert,
  getApps,
  initializeApp,
} from 'firebase-admin/app';
import { Firestore, getFirestore } from 'firebase-admin/firestore';
import type { FirebaseAdminConfig } from './firebase.types';

const FIREBASE_APP_NAME = 'spotwave-backend';

function normalizePrivateKey(value?: string): string | undefined {
  if (!value) {
    return undefined;
  }

  return value.includes('\\n') ? value.replace(/\\n/g, '\n') : value;
}

export function getFirebaseAdminConfigFromEnv(
  env: NodeJS.ProcessEnv,
): FirebaseAdminConfig {
  return {
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: normalizePrivateKey(env.FIREBASE_PRIVATE_KEY),
    credentialsPath: env.FIREBASE_CREDENTIALS_PATH,
  };
}

export function assertFirebaseAdminConfig(
  config: FirebaseAdminConfig,
): FirebaseAdminConfig {
  if (config.credentialsPath) {
    return config;
  }

  if (!config.projectId || !config.clientEmail || !config.privateKey) {
    throw new Error(
      'Firebase Admin SDK is not configured. Provide FIREBASE_CREDENTIALS_PATH or FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY.',
    );
  }

  return config;
}

export function createFirebaseApp(config: FirebaseAdminConfig): App {
  const resolvedConfig = assertFirebaseAdminConfig(config);
  const existing = getApps().find((app) => app.name === FIREBASE_APP_NAME);

  if (existing) {
    return existing;
  }

  const options: AppOptions = resolvedConfig.credentialsPath
    ? {
        credential: cert(resolvedConfig.credentialsPath),
        projectId: resolvedConfig.projectId,
      }
    : {
        credential: cert({
          projectId: resolvedConfig.projectId,
          clientEmail: resolvedConfig.clientEmail,
          privateKey: resolvedConfig.privateKey,
        }),
        projectId: resolvedConfig.projectId,
      };

  return initializeApp(options, FIREBASE_APP_NAME);
}

export function createFirestoreFromEnv(env: NodeJS.ProcessEnv): Firestore {
  const app = createFirebaseApp(getFirebaseAdminConfigFromEnv(env));
  const firestore = getFirestore(app);
  firestore.settings({ ignoreUndefinedProperties: true });
  return firestore;
}

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private app?: App;
  private firestore?: Firestore;

  constructor(private readonly configService: ConfigService) {}

  isConfigured(): boolean {
    const config = this.getConfig();
    return Boolean(
      config.credentialsPath ||
      (config.projectId && config.clientEmail && config.privateKey),
    );
  }

  getFirestore(): Firestore {
    if (!this.firestore) {
      this.initialize();
    }

    return this.firestore as Firestore;
  }

  private getConfig(): FirebaseAdminConfig {
    return {
      projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
      clientEmail: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
      privateKey: normalizePrivateKey(
        this.configService.get<string>('FIREBASE_PRIVATE_KEY'),
      ),
      credentialsPath: this.configService.get<string>(
        'FIREBASE_CREDENTIALS_PATH',
      ),
    };
  }

  private initialize(): void {
    const config = assertFirebaseAdminConfig(this.getConfig());

    this.app = createFirebaseApp(config);
    this.firestore = getFirestore(this.app);
    this.firestore.settings({ ignoreUndefinedProperties: true });

    this.logger.log('Firebase Admin SDK initialized');
  }
}
