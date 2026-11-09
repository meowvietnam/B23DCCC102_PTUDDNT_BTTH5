import React, {useEffect, useState} from 'react';
import {FlatList, StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Avatar from '../components/Avatar';
import {auth} from '../services/firebase';
import {subscribeConversations} from '../services/chatService';
import {subscribeUsers} from '../services/userService';
import {formatTime} from '../utils/time';

export default function HomeScreen({navigation}) {
  const me = auth.currentUser.uid;
  const [convs, setConvs] = useState([]);
  const [users, setUsers] = useState({});

  useEffect(() => {
    const u1 = subscribeConversations(me, setConvs);
    const u2 = subscribeUsers(me, list => {
      const map = {};
      list.forEach(u => (map[u.uid] = u));
      setUsers(map);
    });
    return () => {
      u1();
      u2();
    };
  }, [me]);

  const renderItem = ({item}) => {
    const u = users[item.otherUid] || {};
    const name = u.name || 'Người dùng';
    return (
      <TouchableOpacity
        style={[styles.row, item.unread > 0 && styles.rowUnread]}
        onPress={() =>
          navigation.navigate('Chat', {uid: item.otherUid, name})
        }>
        <Avatar name={name} online={!!u.online} />
        <View style={styles.mid}>
          <Text style={[styles.name, item.unread > 0 && styles.nameUnread]}>{name}</Text>
          <Text
            style={[styles.last, item.unread > 0 && styles.lastUnread]}
            numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unread > 0 && (
            <Text style={styles.unreadLabel}>
              {item.unread > 99 ? '99+' : item.unread} tin nhắn chưa đọc
            </Text>
          )}
        </View>
        <View style={styles.right}>
          <Text style={styles.time}>{formatTime(item.lastTime)}</Text>
          {item.unread > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>
                {item.unread > 99 ? '99+' : item.unread}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <FlatList
      style={styles.container}
      data={convs}
      keyExtractor={i => i.otherUid}
      renderItem={renderItem}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Chưa có cuộc trò chuyện nào. Vào tab Danh bạ để bắt đầu.
        </Text>
      }
    />
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#ddd',
  },
  rowUnread: {backgroundColor: '#e8f1fd'},
  nameUnread: {fontWeight: '800'},
  unreadLabel: {color: '#e53935', fontSize: 12, fontWeight: '700', marginTop: 2},
  mid: {flex: 1, marginHorizontal: 12},
  name: {fontSize: 16, fontWeight: '600'},
  last: {color: '#777', marginTop: 3},
  lastUnread: {color: '#000', fontWeight: '700'},
  right: {alignItems: 'flex-end'},
  time: {color: '#888', fontSize: 12},
  badge: {
    backgroundColor: '#e53935',
    borderRadius: 13,
    minWidth: 26,
    height: 26,
    paddingHorizontal: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  badgeText: {color: '#fff', fontSize: 14, fontWeight: '700'},
  empty: {textAlign: 'center', color: '#888', marginTop: 40, paddingHorizontal: 20},
});
