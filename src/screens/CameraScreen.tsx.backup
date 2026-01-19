import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Image,
} from 'react-native';

export const CameraScreen: React.FC = () => {
  const [isRecording, setIsRecording] = useState(false);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#3E2723" />

      {/* Camera Preview */}
      <View style={styles.cameraPreview}>
        <Image
          source={require('../../assets/placeholder.png')}
          style={styles.previewImage}
          resizeMode="cover"
        />

        {/* Close Button */}
        <TouchableOpacity style={styles.closeButton}>
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Controls */}
      <View style={styles.controls}>
        {/* Gallery Thumbnail */}
        <TouchableOpacity style={styles.galleryButton}>
          <Image
            source={require('../../assets/placeholder.png')}
            style={styles.galleryThumbnail}
            resizeMode="cover"
          />
        </TouchableOpacity>

        {/* Record/Capture Button */}
        <TouchableOpacity
          style={styles.captureButtonOuter}
          onPress={() => setIsRecording(!isRecording)}>
          <View
            style={[
              styles.captureButtonInner,
              isRecording && styles.captureButtonRecording,
            ]}
          />
        </TouchableOpacity>

        {/* Flip Camera Button */}
        <TouchableOpacity style={styles.flipButton}>
          <Text style={styles.flipIcon}>🔄</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#3E2723',
  },
  cameraPreview: {
    flex: 1,
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    left: 16,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeIcon: {
    fontSize: 24,
    color: '#000000',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 40,
    paddingVertical: 32,
    backgroundColor: '#3E2723',
  },
  galleryButton: {
    width: 64,
    height: 64,
    borderRadius: 12,
    overflow: 'hidden',
  },
  galleryThumbnail: {
    width: '100%',
    height: '100%',
  },
  captureButtonOuter: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#F5E6D3',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonInner: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#FFFFFF',
  },
  captureButtonRecording: {
    backgroundColor: '#FF0000',
    borderRadius: 12,
  },
  flipButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  },
  flipIcon: {
    fontSize: 32,
  },
});
