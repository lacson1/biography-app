import { signIn, signUp } from './firebase';
import { saveUserData, getUserData } from './firebase';
import { DEMO_EMAIL, DEMO_PASSWORD, DEMO_SEED_DATA } from './config/demo';

export const LOCAL_DEMO_UID = 'demo-local-design';
const LOCAL_DEMO_SESSION_KEY = 'biography_local_demo_session';

const LOCAL_DEMO_USER = {
  uid: LOCAL_DEMO_UID,
  email: DEMO_EMAIL,
  isLocalDemo: true,
};

function shouldUseLocalFallback(error) {
  const code = error?.code || '';
  const fallbackCodes = new Set([
    'auth/network-request-failed',
    'auth/api-key-not-valid.-please-pass-a-valid-api-key.',
    'auth/invalid-api-key',
    'auth/configuration-not-found',
    'auth/operation-not-allowed',
  ]);
  if (fallbackCodes.has(code)) {
    return true;
  }
  return Boolean(error?.message?.includes('api-key'));
}

/**
 * Sign in to the shared demo account (Firebase), or local storage when auth is unavailable.
 */
export async function signInAsDemo() {
  try {
    const credential = await signIn(DEMO_EMAIL, DEMO_PASSWORD);
    await seedDemoDataIfEmpty(credential.user.uid);
    clearLocalDemoSession();
    return { credential, local: false };
  } catch (error) {
    if (error.code === 'auth/user-not-found') {
      try {
        const credential = await signUp(DEMO_EMAIL, DEMO_PASSWORD);
        await saveUserData(credential.user.uid, {
          ...DEMO_SEED_DATA,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        clearLocalDemoSession();
        return { credential, local: false };
      } catch (signUpError) {
        if (!shouldUseLocalFallback(signUpError)) {
          throw signUpError;
        }
      }
    } else if (!shouldUseLocalFallback(error)) {
      throw error;
    }
  }

  return signInAsDemoLocal();
}

export async function signInAsDemoLocal() {
  persistLocalDemoSession();
  await seedDemoDataIfEmpty(LOCAL_DEMO_UID);
  return { user: LOCAL_DEMO_USER, local: true };
}

export function persistLocalDemoSession() {
  try {
    sessionStorage.setItem(LOCAL_DEMO_SESSION_KEY, '1');
  } catch {
    /* ignore */
  }
}

export function clearLocalDemoSession() {
  try {
    sessionStorage.removeItem(LOCAL_DEMO_SESSION_KEY);
  } catch {
    /* ignore */
  }
}

export function hasLocalDemoSession() {
  try {
    return sessionStorage.getItem(LOCAL_DEMO_SESSION_KEY) === '1';
  } catch {
    return false;
  }
}

export function getLocalDemoUser() {
  return LOCAL_DEMO_USER;
}

async function seedDemoDataIfEmpty(userId) {
  const existing = await getUserData(userId);
  const hasContent =
    existing?.formData?.name ||
    existing?.formData?.overview ||
    (existing?.formData?.timeline?.length ?? 0) > 0;

  if (!hasContent) {
    await saveUserData(userId, {
      ...DEMO_SEED_DATA,
      createdAt: existing?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }
}

export function getDemoLoginLabel() {
  return `Demo (${DEMO_EMAIL})`;
}
