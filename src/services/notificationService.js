import notifee, {AndroidImportance, EventType} from '@notifee/react-native';

const CHANNEL_ID = 'messages';
let activeChatUid = null;

// Chat đang mở: không báo cho tin của người này.
export function setActiveChat(uid) {
  activeChatUid = uid;
}
export const getActiveChat = () => activeChatUid;

export async function initNotifications() {
  try {
    await notifee.requestPermission();
    await notifee.createChannel({
      id: CHANNEL_ID,
      name: 'Tin nhắn',
      importance: AndroidImportance.HIGH,
    });
  } catch (e) {}
}

export async function showMessageNotification(uid, name, body) {
  try {
    await notifee.displayNotification({
      id: uid, // gộp thông báo theo người gửi
      title: name,
      body,
      data: {uid, name},
      android: {
        channelId: CHANNEL_ID,
        smallIcon: 'ic_launcher',
        pressAction: {id: 'default'},
        importance: AndroidImportance.HIGH,
      },
    });
  } catch (e) {}
}

export function clearNotification(uid) {
  notifee.cancelNotification(uid).catch(() => {});
}

// Khi bấm vào thông báo → mở chat tương ứng.
export function onNotificationPress(handler) {
  const unsub = notifee.onForegroundEvent(({type, detail}) => {
    if (type === EventType.PRESS && detail.notification?.data) {
      handler(detail.notification.data);
    }
  });
  notifee.getInitialNotification().then(n => n?.notification?.data && handler(n.notification.data));
  return unsub;
}
