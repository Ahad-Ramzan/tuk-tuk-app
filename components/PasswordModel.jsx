import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Alert,
  Dimensions,
  TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ThemedButton from './ThemedButton'; 

const { width } = Dimensions.get('window');

const PasswordModal = ({ visible, onClose, onSuccess }) => {
  const [pin, setPin] = useState(['', '', '', '']);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (visible) {
      setPin(['', '', '', '']);
      setCurrentIndex(0);
    }
  }, [visible]);

  const handlePinChange = (value, index) => {

    if (value.length > 1) return;
    
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);


    if (value && index < 3) {
      const nextRef = inputRefs.current[index + 1];
    nextRef?.focus(); 
    }

    
    if (index === 3 && value) {
      setTimeout(() => verifyPin(newPin), 100);
    }
  };

  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && !pin[index] && index > 0) {
      setCurrentIndex(index - 1);
    }
  };

  const verifyPin = async (enteredPin) => {
    setIsLoading(true);
    try {
      const storedPin = await AsyncStorage.getItem("USER_PIN");
      const enteredPinString = enteredPin.join('');
      
      if (storedPin === enteredPinString) {
        
        onSuccess();
        onClose();
      } else {
        
        Alert.alert(
          'Incorrect PIN',
          'The PIN you entered is incorrect. Please try again.',
          [
            {
              text: 'OK',
              onPress: () => {
                setPin(['', '', '', '']);
                setCurrentIndex(0);
              }
            }
          ]
        );
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify PIN. Please try again.');
      console.error('PIN verification error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setPin(['', '', '', '']);
    setCurrentIndex(0);
    onClose();
  };

  const handleContinue = () => {
    const enteredPin = pin.join('');
    if (enteredPin.length === 4) {
      verifyPin(pin);
    } else {
      Alert.alert('Incomplete PIN', 'Please enter all 4 digits.');
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
        
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={handleCancel}
          >
            <Text style={styles.closeButtonText}>✕</Text>
          </TouchableOpacity>

        
          <Text style={styles.title}>Enter your password</Text>
          <Text style={styles.subtitle}>To start the challenge</Text>

          
          <Text style={styles.passwordLabel}>Password</Text>

          <View style={styles.pinContainer}>
            {pin.map((digit, index) => (
              <TextInput
              ref={(ref) => (inputRefs.current[index] = ref)}
                key={index}
                style={[
                  styles.pinBox,
                  currentIndex === index && styles.activePinBox
                ]}
                value={digit}
                onChangeText={(value) => handlePinChange(value, index)}
                onKeyPress={(e) => handleKeyPress(e, index)}
                onFocus={() => setCurrentIndex(index)}
                keyboardType="numeric"
                maxLength={1}
                secureTextEntry={true}
                textAlign="center"
                autoFocus={index === 0}
                editable={!isLoading}
              />
            ))}
          </View>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleCancel}
              disabled={isLoading}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>

            <ThemedButton onPress={handleContinue} title={isLoading ? 'Verifying...' : 'Continue'} disabled={isLoading} />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    width: width * 0.9,
    maxWidth: 400,
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: '#666',
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  passwordLabel: {
    fontSize: 16,
    color: '#333',
    alignSelf: 'flex-start',
    marginBottom: 16,
    fontWeight: '500',
  },
  pinContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 40,
    width: '80%',
  },
  pinBox: {
    width: 50,
    height: 50,
    borderWidth: 2,
    borderColor: '#3B82F6',
    borderRadius: 12,
    backgroundColor: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  activePinBox: {
    borderColor: '#1D4ED8',
    backgroundColor: '#F0F9FF',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: 16,
    marginTop: 20,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    backgroundColor: 'white',
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  continueButton: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 25,
    backgroundColor: '#3B82F6',
    alignItems: 'center',
  },
  disabledButton: {
    backgroundColor: '#9CA3AF',
  },
  continueButtonText: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
});

export default PasswordModal;
