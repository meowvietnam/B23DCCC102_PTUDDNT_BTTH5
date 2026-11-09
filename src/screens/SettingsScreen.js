import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import Avatar from '../components/Avatar';
import {auth} from '../services/firebase';
import {logout} from '../services/authService';

export default function SettingsScreen() {
  const u = auth.currentUser;
  return (
    <View style={styles.container}>
      <Avatar name={u?.displayName || u?.email || '?'} size={72} />
      <Text style={styles.name}>{u?.displayName}</Text>
      <Text style={styles.email}>{u?.email}</Text>
      <TouchableOpacity style={styles.btn} onPress={logout}>
        <Text style={styles.btnText}>Đăng xuất</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', paddingTop: 40, backgroundColor: '#fff'},
  name: {fontSize: 20, fontWeight: '700', marginTop: 12},
  email: {color: '#777', marginTop: 4},
  btn: {
    marginTop: 32,
    backgroundColor: '#e53935',
    borderRadius: 10,
    paddingVertical: 13,
    paddingHorizontal: 40,
  },
  btnText: {color: '#fff', fontWeight: '700', fontSize: 16},
});
