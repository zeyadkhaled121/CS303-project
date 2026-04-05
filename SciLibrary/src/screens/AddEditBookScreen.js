import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView, Image, KeyboardAvoidingView, Platform } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { addBook, updateBook, resetBookSlice, fetchAllBooks } from '../store/books';
import Toast from 'react-native-toast-message';
import * as ImagePicker from 'expo-image-picker';

export default function AddEditBookScreen({ route, navigation }) {
  const bookToEdit = route.params?.book;
  const isEditing = !!bookToEdit;

  const dispatch = useDispatch();
  const { loading, error, message } = useSelector((state) => state.book);
  const { user } = useSelector((state) => state.auth);

  // Role validation - Admin only
  const isAdmin = user?.role === 'Admin' || user?.role === 'Super Admin';
  if (!isAdmin) {
    return (
      <View style={styles.container}>
        <View style={styles.accessDeniedContainer}>
          <Text style={styles.accessDeniedText}>Access Denied</Text>
          <Text style={styles.accessDeniedSubtext}>Admin access required</Text>
        </View>
      </View>
    );
  }

  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [genre, setGenre] = useState('');
  const [edition, setEdition] = useState('');
  const [totalCopies, setTotalCopies] = useState('');
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState('');

  useEffect(() => {
    if (isEditing) {
      setTitle(bookToEdit.title || '');
      setAuthor(bookToEdit.author || '');
      setGenre(bookToEdit.genre || '');
      setEdition(bookToEdit.edition || '');
      setTotalCopies(bookToEdit.totalCopies ? bookToEdit.totalCopies.toString() : '');
      setImagePreview(bookToEdit.image?.url || '');
    }
  }, [bookToEdit]);

  useEffect(() => {
    if (message) {
      Toast.show({ type: 'success', text1: 'Success', text2: message });
      dispatch(resetBookSlice());
      dispatch(fetchAllBooks()); 
      navigation.goBack(); 
    }
    if (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: error });
      dispatch(resetBookSlice());
    }
  }, [message, error, dispatch, navigation]);

  const pickImage = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [3, 4],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0]);
      setImagePreview(result.assets[0].uri);
    }
  };

  const handleSubmit = () => {
    if (!title || !author || !genre || !edition || !totalCopies) {
      Toast.show({ type: 'error', text1: 'Validation Error', text2: 'Please fill all fields' });
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("genre", genre);
    formData.append("edition", edition);
    formData.append("totalCopies", parseInt(totalCopies, 10));

    if (image) {
      const localUri = image.uri;
      const filename = localUri.split('/').pop();
      const match = /\.(\w+)$/.exec(filename);
      const type = match ? `image/${match[1]}` : `image`;
      formData.append('image', { uri: localUri, name: filename, type });
    }

    if (isEditing) {
      dispatch(updateBook({ id: bookToEdit._id || bookToEdit.id, formData }));
    } else {
      dispatch(addBook(formData));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.container}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isEditing ? "Edit Book" : "Add New Book"}</Text>
        <Text style={styles.headerSubtitle}>{isEditing ? "Update the book details below." : "Fill in the details to add a new book."}</Text>

        {/* Image Picker */}
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {imagePreview ? (
            <Image source={{ uri: imagePreview }} style={styles.previewImage} />
          ) : (
            <View style={styles.placeholderContainer}>
              <Text style={styles.placeholderIcon}>📸</Text>
              <Text style={styles.placeholderText}>Tap to upload cover</Text>
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Title</Text>
          <TextInput style={styles.input} value={title} onChangeText={setTitle} placeholder="Enter book title" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Author</Text>
          <TextInput style={styles.input} value={author} onChangeText={setAuthor} placeholder="Enter author name" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Genre</Text>
          <TextInput style={styles.input} value={genre} onChangeText={setGenre} placeholder="e.g. Science, Fiction, History" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Edition</Text>
          <TextInput style={styles.input} value={edition} onChangeText={setEdition} placeholder="e.g. 1st, 2nd, 3rd" />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Number of Copies</Text>
          <TextInput style={styles.input} value={totalCopies} onChangeText={setTotalCopies} placeholder="e.g. 10" keyboardType="numeric" />
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>{isEditing ? "Update Book" : "Add Book"}</Text>}
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#f9fafb', padding: 20, paddingTop: 50 },
  accessDeniedContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
  accessDeniedText: { fontSize: 20, fontWeight: 'bold', color: '#dc2626', marginBottom: 8, textAlign: 'center' },
  accessDeniedSubtext: { fontSize: 14, color: '#6b7280', textAlign: 'center' },
  backBtn: { marginBottom: 20 },
  backText: { color: '#358a74', fontWeight: 'bold', fontSize: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#111' },
  headerSubtitle: { fontSize: 14, color: '#6b7280', marginBottom: 30, marginTop: 4 },
  imagePicker: { width: '100%', height: 200, backgroundColor: '#fff', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#d1d5db', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', marginBottom: 20 },
  previewImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  placeholderContainer: { alignItems: 'center' },
  placeholderIcon: { fontSize: 40, marginBottom: 8 },
  placeholderText: { color: '#9ca3af', fontWeight: 'bold' },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 12, fontWeight: 'bold', color: '#6b7280', textTransform: 'uppercase', marginBottom: 6, marginLeft: 4 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#e5e7eb', padding: 14, borderRadius: 12, fontSize: 15, color: '#111' },
  submitBtn: { backgroundColor: '#358a74', padding: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#358a74', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});