import {
  onValue,
  push,
  ref,
  increment,
  serverTimestamp,
  set,
  update,
} from 'firebase/database';
import {db} from './firebase';

export const getChatId = (a, b) => [a, b].sort().join('_');

// Ghi tin (thường hoặc vị trí), cập nhật tin cuối cho cả hai và tăng số chưa đọc của người nhận.
async function pushMessage(myUid, otherUid, payload, preview) {
  const chatId = getChatId(myUid, otherUid);
  const msgRef = push(ref(db, `chats/${chatId}/messages`));
  await set(msgRef, {
    senderId: myUid,
    ...payload,
    createdAt: serverTimestamp(),
  });
  const now = Date.now();
  // Ghi một lần, không cần quyền đọc node của người nhận (increment chạy phía server).
  await update(ref(db), {
    [`userChats/${myUid}/${otherUid}/lastMessage`]: preview,
    [`userChats/${myUid}/${otherUid}/lastTime`]: now,
    [`userChats/${myUid}/${otherUid}/lastSenderId`]: myUid,
    [`userChats/${myUid}/${otherUid}/unread`]: 0,
    [`userChats/${otherUid}/${myUid}/lastMessage`]: preview,
    [`userChats/${otherUid}/${myUid}/lastTime`]: now,
    [`userChats/${otherUid}/${myUid}/lastSenderId`]: myUid,
    [`userChats/${otherUid}/${myUid}/unread`]: increment(1),
  });
}

export async function sendMessage(myUid, otherUid, text) {
  const clean = (text || '').trim();
  if (!clean) {
    return;
  }
  await pushMessage(myUid, otherUid, {type: 'text', text: clean}, clean);
}

export async function sendLocation(myUid, otherUid, coords) {
  await pushMessage(
    myUid,
    otherUid,
    {
      type: 'location',
      text: '📍 Vị trí',
      lat: coords.latitude,
      lng: coords.longitude,
    },
    '📍 Vị trí',
  );
}

export function subscribeMessages(myUid, otherUid, callback) {
  const chatId = getChatId(myUid, otherUid);
  return onValue(ref(db, `chats/${chatId}/messages`), snap => {
    const list = [];
    snap.forEach(child => {
      list.push({id: child.key, ...child.val()});
    });
    list.sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    callback(list);
  });
}

export function markRead(myUid, otherUid) {
  return update(ref(db, `userChats/${myUid}/${otherUid}`), {unread: 0});
}

export function subscribeConversations(myUid, callback) {
  return onValue(ref(db, `userChats/${myUid}`), snap => {
    const list = [];
    snap.forEach(child => {
      const v = child.val();
      if (v && v.lastMessage) {
        list.push({otherUid: child.key, ...v});
      }
    });
    list.sort((a, b) => (b.lastTime || 0) - (a.lastTime || 0));
    callback(list);
  });
}
