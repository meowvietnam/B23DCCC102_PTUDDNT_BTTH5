import React, {useEffect, useLayoutEffect, useRef, useState} from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Alert,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import {auth} from '../services/firebase';
import {
  markRead,
  sendLocation,
  sendMessage,
  subscribeMessages,
} from '../services/chatService';
import {getCurrentCoords} from '../services/locationService';
import {clearNotification, setActiveChat} from '../services/notificationService';
import {subscribeUser} from '../services/userService';
import {formatTime} from '../utils/time';

export default function ChatScreen({route, navigation}) {
  const {uid: otherUid, name: initialName} = route.params;
  const me = auth.currentUser.uid;
  const [messages, setMessages] = useState([]);
  const [other, setOther] = useState({name: initialName});
  const [text, setText] = useState('');
  const [locating, setLocating] = useState(false);
  const listRef = useRef(null);

  // Đánh dấu chat đang mở để không bắn thông báo cho tin của người này
  useEffect(() => {
    setActiveChat(otherUid);
    clearNotification(otherUid);
    return () => setActiveChat(null);
  }, [otherUid]);

  // Trạng thái của người đang chat
  useEffect(() => subscribeUser(otherUid, u => u && setOther(u)), [otherUid]);

  // Tin nhắn realtime; cleanup để không bị lắng nghe trùng lặp.
  useEffect(() => {
    const unsub = subscribeMessages(me, otherUid, list => {
      setMessages(list);
      markRead(me, otherUid).catch(() => {});
    });
    markRead(me, otherUid).catch(() => {});
    return unsub;
  }, [me, otherUid]);

  useLayoutEffect(() => {
    navigation.setOptions({
      headerTitle: () => (
        <View style={styles.header}>
          <Avatar name={other.name || '?'} size={36} online={!!other.online} />
          <View style={styles.headerText}>
            <Text style={styles.headerName}>{other.name}</Text>
            <Text style={styles.headerStatus}>
              {other.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
            </Text>
          </View>
        </View>
      ),
    });
  }, [navigation, other]);

  const canSend = text.trim().length > 0;

  const onSend = () => {
    if (!canSend) {
      return;
    }
    const t = text;
    setText('');
    sendMessage(me, otherUid, t).catch(() => setText(t));
  };

  const onSendLocation = async () => {
    setLocating(true);
    const c = await getCurrentCoords();
    setLocating(false);
    if (!c) {
      Alert.alert('Không lấy được vị trí', 'Hãy bật GPS và cấp quyền vị trí.');
      return;
    }
    sendLocation(me, otherUid, c).catch(() => {});
  };

  const openMap = m =>
    Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${m.lat},${m.lng}`);

  const renderItem = ({item}) => {
    const mine = item.senderId === me;
    const isLoc = item.type === 'location';
    return (
      <View style={[styles.bubbleRow, mine ? styles.rowRight : styles.rowLeft]}>
        <View style={[styles.bubble, mine ? styles.mine : styles.theirs]}>
          {isLoc ? (
            <TouchableOpacity onPress={() => openMap(item)}>
              <Text style={mine ? styles.mineText : styles.theirsText}>📍 Vị trí được chia sẻ</Text>
              <Text style={[styles.coords, mine && styles.timeMine]}>
                {Number(item.lat).toFixed(5)}, {Number(item.lng).toFixed(5)}
              </Text>
              <Text style={[styles.link, mine && styles.timeMine]}>Nhấn để mở bản đồ</Text>
            </TouchableOpacity>
          ) : (
            <Text style={mine ? styles.mineText : styles.theirsText}>
              {item.text}
            </Text>
          )}
          <Text style={[styles.time, mine && styles.timeMine]}>
            {formatTime(item.createdAt)}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}>
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={m => m.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        onContentSizeChange={() => listRef.current?.scrollToEnd({animated: true})}
        onLayout={() => listRef.current?.scrollToEnd({animated: false})}
      />
      <View style={styles.inputBar}>
        <TouchableOpacity style={styles.locBtn} onPress={onSendLocation} disabled={locating}>
          <Text style={styles.locIcon}>{locating ? '…' : '📍'}</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.input}
          placeholder="Nhập tin nhắn..."
          value={text}
          onChangeText={setText}
          multiline
        />
        <TouchableOpacity
          style={[styles.send, !canSend && styles.sendDisabled]}
          onPress={onSend}
          disabled={!canSend}>
          <Text style={styles.sendText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#f2f4f7'},
  header: {flexDirection: 'row', alignItems: 'center'},
  headerText: {marginLeft: 10},
  headerName: {fontSize: 16, fontWeight: '700'},
  headerStatus: {fontSize: 12, color: '#777'},
  list: {padding: 10},
  bubbleRow: {flexDirection: 'row', marginVertical: 3},
  rowRight: {justifyContent: 'flex-end'},
  rowLeft: {justifyContent: 'flex-start'},
  bubble: {maxWidth: '78%', borderRadius: 14, paddingHorizontal: 12, paddingVertical: 7},
  mine: {backgroundColor: '#1e88e5', borderBottomRightRadius: 4},
  theirs: {backgroundColor: '#fff', borderBottomLeftRadius: 4},
  mineText: {color: '#fff', fontSize: 16},
  theirsText: {color: '#000', fontSize: 16},
  time: {fontSize: 10, color: '#888', marginTop: 3, alignSelf: 'flex-end'},
  timeMine: {color: '#d6e9fb'},
  inputBar: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 8,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    fontSize: 16,
  },
  send: {
    marginLeft: 8,
    backgroundColor: '#1e88e5',
    borderRadius: 20,
    paddingHorizontal: 18,
    paddingVertical: 11,
  },
  locBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 8,
    backgroundColor: '#eceff1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locIcon: {fontSize: 20},
  coords: {fontSize: 12, color: '#555', marginTop: 2},
  link: {fontSize: 12, color: '#1e88e5', marginTop: 2},
  sendDisabled: {backgroundColor: '#b0bec5'},
  sendText: {color: '#fff', fontWeight: '700'},
});
