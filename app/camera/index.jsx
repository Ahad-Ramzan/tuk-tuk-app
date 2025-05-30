import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { CameraView, CameraType, useCameraPermissions } from 'expo-camera';
import { VideoView, useVideoPlayer } from 'expo-video';

const VideoRecorderComponent = () => {
  const [facing, setFacing] = useState(CameraType?.back);
  const [permission, requestPermission] = useCameraPermissions();
  const [isRecording, setIsRecording] = useState(false);
  const [recordedVideo, setRecordedVideo] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const cameraRef = useRef(null);

  // Create video player for preview
  const player = useVideoPlayer(recordedVideo, player => {
    player.loop = true;
    player.muted = false;
  });

  // Request camera permission if not granted
  if (!permission) {
    return <View />;
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text style={styles.message}>We need your permission to show the camera</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.button}>
          <Text style={styles.buttonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const toggleCameraFacing = () => {
    setFacing(current => (current === CameraType.back ? CameraType.front : CameraType.back));
  };

  const startRecording = async () => {
    if (cameraRef.current && !isRecording) {
      try {
        setIsRecording(true);
        const video = await cameraRef.current.recordAsync({
          quality: '720p',
          maxDuration: 20, 
          mute: false,
        });
        setRecordedVideo(video.uri);
      } catch (error) {
        console.error('Error recording video:', error);
        Alert.alert('Error', 'Failed to record video');
      } finally {
        setIsRecording(false);
      }
    }
  };

  const stopRecording = () => {
    if (cameraRef.current && isRecording) {
      cameraRef.current.stopRecording();
    }
  };

  const retakeVideo = () => {
    setRecordedVideo(null);
    if (player) {
      player.pause();
    }
  };

  const playPreview = () => {
    if (player) {
      player.play();
    }
  };

  const pausePreview = () => {
    if (player) {
      player.pause();
    }
  };

  const submitVideo = async () => {
    if (!recordedVideo) return;

    try {
      setIsUploading(true);
      
      // Create form data for multipart upload
      const formData = new FormData();
      formData.append('video', {
        uri: recordedVideo,
        type: 'video/mp4',
        name: 'recorded_video.mp4',
      });

      // Replace with your actual API endpoint
      const response = await fetch('YOUR_API_ENDPOINT_HERE', {
        method: 'POST',
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data',
          // Add any auth headers if needed
          // 'Authorization': 'Bearer your-token-here',
        },
      });

      if (response.ok) {
        const result = await response.json();
        Alert.alert('Success', 'Video uploaded successfully!');
        setRecordedVideo(null); // Clear the recorded video
        console.log('Upload result:', result);
      } else {
        throw new Error("Upload failed with status: ");
      }
    } catch (error) {
      console.error('Error uploading video:', error);
      Alert.alert('Error', 'Failed to upload video. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Preview screen when video is recorded
  if (recordedVideo) {
    return (
      <View style={styles.container}>
        <VideoView
          style={styles.video}
          player={player}
          allowsFullscreen={false}
          allowsPictureInPicture={false}
          contentFit="contain"
        />
        <View style={styles.previewControls}>
          <TouchableOpacity 
            style={[styles.button, styles.playButton]} 
            onPress={playPreview}
          >
            <Text style={styles.buttonText}>Play</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.pauseButton]} 
            onPress={pausePreview}
          >
            <Text style={styles.buttonText}>Pause</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.actionControls}>
          <TouchableOpacity 
            style={[styles.button, styles.retakeButton]} 
            onPress={retakeVideo}
            disabled={isUploading}
          >
            <Text style={styles.buttonText}>Retake</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.button, styles.submitButton]} 
            onPress={submitVideo}
            disabled={isUploading}
          >
            {isUploading ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <Text style={styles.buttonText}>Submit</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Camera screen
  return (
    <View style={styles.container}>
      <CameraView 
        style={styles.camera} 
        facing={facing}
        ref={cameraRef}
        mode="video"
      >
        <View style={styles.buttonContainer}>
          <TouchableOpacity style={styles.flipButton} onPress={toggleCameraFacing}>
            <Text style={styles.flipText}>Flip Camera</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.recordingControls}>
          {isRecording && (
            <View style={styles.recordingIndicator}>
              <View style={styles.redDot} />
              <Text style={styles.recordingText}>Recording...</Text>
            </View>
          )}
          
          <TouchableOpacity
            style={[
              styles.recordButton,
              isRecording && styles.recordButtonActive
            ]}
            onPress={isRecording ? stopRecording : startRecording}
          >
            <View style={[
              styles.recordButtonInner,
              isRecording && styles.recordButtonInnerActive
            ]} />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
  },
  message: {
    textAlign: 'center',
    paddingBottom: 10,
    color: 'white',
    fontSize: 16,
  },
  camera: {
    flex: 1,
  },
  video: {
    flex: 1,
  },
  buttonContainer: {
    flex: 1,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    margin: 20,
  },
  flipButton: {
    flex: 1,
    alignSelf: 'flex-end',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 10,
    borderRadius: 5,
  },
  flipText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  recordingControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  recordingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  redDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: 'red',
    marginRight: 8,
  },
  recordingText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  recordButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'white',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  recordButtonActive: {
    borderColor: 'red',
  },
  recordButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'red',
  },
  recordButtonInnerActive: {
    borderRadius: 8,
    width: 40,
    height: 40,
  },
  previewControls: {
    position: 'absolute',
    top: 100,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  actionControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 40,
  },
  button: {
    backgroundColor: '#2196F3',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  playButton: {
    backgroundColor: '#4CAF50',
  },
  pauseButton: {
    backgroundColor: '#FF9800',
  },
  retakeButton: {
    backgroundColor: '#757575',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default VideoRecorderComponent;