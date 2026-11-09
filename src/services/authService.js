import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {ref, set} from 'firebase/database';
import {auth, db} from './firebase';
import {setOffline} from './userService';

export async function register(name, email, password) {
  const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
  await updateProfile(cred.user, {displayName: name.trim()});
  await set(ref(db, `users/${cred.user.uid}`), {
    uid: cred.user.uid,
    name: name.trim(),
    email: email.trim().toLowerCase(),
    online: true,
    lastSeen: Date.now(),
  });
  return cred.user;
}

export function login(email, password) {
  return signInWithEmailAndPassword(auth, email.trim(), password);
}

export async function logout() {
  try {
    await setOffline();
  } catch (e) {}
  await signOut(auth);
}

export function authErrorMessage(e) {
  switch (e && e.code) {
    case 'auth/email-already-in-use':
      return 'Email này đã được đăng ký.';
    case 'auth/invalid-email':
      return 'Email không hợp lệ.';
    case 'auth/weak-password':
      return 'Mật khẩu phải có ít nhất 6 ký tự.';
    case 'auth/network-request-failed':
      return 'Lỗi mạng, vui lòng thử lại.';
    case 'auth/invalid-credential':
    case 'auth/user-not-found':
    case 'auth/wrong-password':
      return 'Sai tài khoản hoặc mật khẩu.';
    default:
      return 'Đã có lỗi xảy ra: ' + ((e && e.message) || 'không rõ');
  }
}
