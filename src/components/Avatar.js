import React from 'react';
import {StyleSheet, Text, View} from 'react-native';

const COLORS = ['#1e88e5', '#8e24aa', '#43a047', '#fb8c00', '#e53935', '#00897b'];

export default function Avatar({name = '?', size = 48, online}) {
  // Viết tắt: chữ cái đầu của họ + chữ cái đầu của tên (VD: Đinh Hoàng Long -> ĐL)
  const words = name.trim().split(/\s+/).filter(Boolean);
  const initial = (
    words.length > 1
      ? words[0][0] + words[words.length - 1][0]
      : words[0]?.[0] || '?'
  ).toUpperCase();
  const color = COLORS[(name.charCodeAt(0) || 0) % COLORS.length];
  return (
    <View style={{width: size, height: size}}>
      <View
        style={[
          styles.circle,
          {width: size, height: size, borderRadius: size / 2, backgroundColor: color},
        ]}>
        <Text style={[styles.text, {fontSize: size * (initial.length > 1 ? 0.36 : 0.42)}]}>{initial}</Text>
      </View>
      {online !== undefined && (
        <View
          style={[
            styles.dot,
            {backgroundColor: online ? '#2ecc71' : '#9e9e9e'},
          ]}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {alignItems: 'center', justifyContent: 'center'},
  text: {color: '#fff', fontWeight: '700'},
  dot: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    width: 13,
    height: 13,
    borderRadius: 7,
    borderWidth: 2,
    borderColor: '#fff',
  },
});
