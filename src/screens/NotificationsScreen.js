import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

export default function NotificationsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Chưa có thông báo nào.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff'},
  text: {color: '#888', fontSize: 16},
});
