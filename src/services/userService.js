import {
  onValue,
  ref,
  update,
  onDisconnect,
  serverTimestamp,
} from 'firebase/database';
import {auth, db} from './firebase';

// Theo dõi kết nối và cập nhật trạng thái online/offline của người dùng hiện tại.
// Trả về hàm hủy lắng nghe.
export function startPresence(uid) {
  const userRef = ref(db, `users/${uid}`);
  const unsub = onValue(ref(db, '.info/connected'), snap => {
    if (snap.val() === true) {
      onDisconnect(userRef)
        .update({online: false, lastSeen: serverTimestamp()})
        .then(() => update(userRef, {online: true}))
        .catch(() => {});
    }
  });
  return unsub;
}

export function setOffline() {
  const u = auth.currentUser;
  if (!u) {
    return Promise.resolve();
  }
  return update(ref(db, `users/${u.uid}`), {
    online: false,
    lastSeen: Date.now(),
  });
}

export function saveLocation(uid, coords) {
  return update(ref(db, `users/${uid}`), {
    location: {lat: coords.latitude, lng: coords.longitude},
  });
}

// Danh sách người dùng (không gồm bản thân), cập nhật realtime.
export function subscribeUsers(myUid, callback) {
  return onValue(ref(db, 'users'), snap => {
    const list = [];
    snap.forEach(child => {
      const v = child.val();
      if (child.key !== myUid && v) {
        list.push({...v, uid: child.key});
      }
    });
    list.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    callback(list);
  });
}

export function subscribeUser(uid, callback) {
  return onValue(ref(db, `users/${uid}`), snap => callback(snap.val()));
}
