import React, { useEffect, useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';

export default function AskUsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [question, setQuestion] = useState('');

  const [fullNameError, setFullNameError] = useState(false);
  const [emailError, setEmailError] = useState(false);
  const [questionError, setQuestionError] = useState(false);

  // Modal kapandığında formu sıfırla
  useEffect(() => {
    if (!visible) {
      clearForm();
    }
  }, [visible]);

  const clearForm = () => {
    setFullName('');
    setPhone('');
    setEmail('');
    setQuestion('');
    setFullNameError(false);
    setEmailError(false);
    setQuestionError(false);
  };

  const handleSubmit = async () => {
    const isFullNameValid = fullName.trim() !== '';
    const isEmailValid = email.trim() !== '';
    const isQuestionValid = question.trim() !== '';

    setFullNameError(!isFullNameValid);
    setEmailError(!isEmailValid);
    setQuestionError(!isQuestionValid);

    if (!isFullNameValid || !isEmailValid || !isQuestionValid) {
      return;
    }

    try {
      await addDoc(collection(db, 'iletisimSorulari'), {
        fullName,
        phone,
        email,
        question,
        createdAt: new Date(),
      });
      clearForm();
      onClose();
    } catch (error) {
      console.log('Veri gönderilemedi:', error);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardAvoiding}
        >
          <View style={styles.modalContainer}>
            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              <Text style={styles.title}>Bize Sor</Text>

              <TextInput
                style={[styles.input, fullNameError && styles.inputError]}
                placeholder="Ad Soyad"
                value={fullName}
                onChangeText={(text) => {
                  setFullName(text);
                  setFullNameError(false);
                }}
              />

              <TextInput
                style={styles.input}
                placeholder="Telefon Numarası"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />

              <TextInput
                style={[styles.input, emailError && styles.inputError]}
                placeholder="Mail Adresi"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setEmailError(false);
                }}
                keyboardType="email-address"
              />

              <TextInput
                style={[styles.input, styles.textArea, questionError && styles.inputError]}
                placeholder="Sorunuz"
                value={question}
                onChangeText={(text) => {
                  setQuestion(text);
                  setQuestionError(false);
                }}
                multiline
                numberOfLines={4}
              />

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={handleSubmit}>
                  <Text style={styles.buttonText}>Gönder</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.button, styles.cancelButton]}
                  onPress={() => {
                    clearForm();
                    onClose();
                  }}
                >
                  <Text style={styles.buttonText}>İptal</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  keyboardAvoiding: {
    flex: 1,
  },
  modalContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    margin: 20,
    padding: 20,
    maxHeight: '90%',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 6,
  },
  inputError: {
    borderColor: 'red',
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#888',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
