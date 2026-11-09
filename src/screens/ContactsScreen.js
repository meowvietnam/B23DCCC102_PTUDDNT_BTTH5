import React, {useEffect, useMemo, useState} from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import Avatar from '../components/Avatar';
import {auth} from '../services/firebase';
import {subscribeUsers} from '../services/userService';

export default function ContactsScreen({navigation}) {
  const me = auth.currentUser.uid;
  const [users, setUsers] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => subscribeUsers(me, setUsers), [me]);

  const data = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) {
      return users;
    }
    return users.filter(
      u =>
        (u.name || '').toLowerCase().includes(k) ||
        (u.email || '').toLowerCase().includes(k),
    );
  }, [users, q]);

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.search}
        placeholder="Tìm kiếm theo tên hoặc email..."
        value={q}
        onChangeText={setQ}
      />
      <FlatList
        data={data}
        keyExtractor={u => u.uid}
        keyboardShouldPersistTaps="handled"
        renderItem={({item}) => (
          <TouchableOpacity
            style={styles.row}
            onPress={() =>
              navigation.navigate('Chat', {uid: item.uid, name: item.name})
            }>
            <Avatar name={item.name} online={!!item.online} />
            <View style={styles.mid}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.status}>
                {item.online ? 'Đang hoạt động' : 'Ngoại tuyến'}
              </Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>Không tìm thấy người dùng.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#fff'},
  search: {
    margin: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  mid: {marginLeft: 12},
  name: {fontSize: 16, fontWeight: '600'},
  status: {color: '#888', marginTop: 2},
  empty: {textAlign: 'center', color: '#888', marginTop: 40},
});
