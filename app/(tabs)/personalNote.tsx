import { useState } from 'react';
import { StyleSheet, Image, Platform, View, Pressable, ImageBackground } from 'react-native';
import { Collapsible } from '@/components/Collapsible';
import * as ImagePicker from 'expo-image-picker';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { FontAwesome5, FontAwesome6 } from '@expo/vector-icons';
import { AddButton } from '@/components/AddButton';
import NewNoteModal from '@/components/NewNoteModal';
import { deleteNote, getNotes } from '@/config/db';
import { useQuery } from '@tanstack/react-query';
import DelConfirmModal from '@/components/DelConfirmModal';
import NoteEditModal, { NoteEditProps } from '@/components/NoteEditModal';
import ImageEdit from '@/components/ImageEdit';

export default function PersonalNoteScreen() {
  const [showNoteForm, setShowNoteForm] = useState<boolean>(false);
  const [showDelModal, setShowDelModal] = useState<boolean>(false);
  const [showEditModal, setShowEditModal] = useState<boolean>(false);
  const [noteId, setNoteId] = useState<number>(0);
  const [currNote, setCurrNote] = useState<NoteEditProps>({
    id: 0,
    title: '',
    content: ''
  });
  const [topImg, setTopImg] = useState<string | null>(null); // Initial image

  const pickAndResizeImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true, // This is important for iOS to allow some basic adjustments
      aspect: [16, 9], // Example: Requesting a 16:9 aspect ratio
      quality: 0.8, // Adjust as needed
    });

    if (!result.canceled) {
      setTopImg(result.assets[0].uri);
    }
  };

  const fetchAllNote = async () => {
    try {
      const getNoteRes = await getNotes();
      return getNoteRes;
    } catch (error) {
      console.log('getAllNotes: ', error);
    }
  }

  const { data: allNotes = [], refetch } = useQuery({
    queryKey: ['all-notes'],
    queryFn: fetchAllNote,
    initialData: []
  });

  const handleConfirmDel = async (id: number) => {
    setNoteId(id);
    setShowDelModal(true);
  }

  const handleNoteDeletion = async () => {
    try {
      const response = await deleteNote(noteId);

      refetch();
    } catch (error) {
      console.log('NoteDelete: ', error);
    }
  }

  const handleNoteEditing = async (note: NoteEditProps) => {
    try {
      setCurrNote(note);
      setShowEditModal(true);

    } catch (error) {
      console.log('Error editing: ', error);
    }
  }

  return (
    <View style={styles.container}>
      <ParallaxScrollView
        headerBackgroundColor={{ light: '#353636', dark: '#353636' }}
        headerImage={
          <View style={styles.headerContainer}>
            <ImageBackground
              source={topImg ? { uri: topImg } : require('@/assets/images/archive.jpg')}
              style={styles.topImage}
              resizeMode='cover'
            >
              <ImageEdit onChange={pickAndResizeImage} onRestore={() => setTopImg(null)} />

              <ThemedView lightColor='rgba(0, 0, 0, 0.5)' darkColor='rgba(0, 0, 0, 0.5)' style={styles.pgTheme}>
                <ThemedText style={{ textAlign: 'center', fontSize: 14 }} >"I would...take note of what he says to me" - Job 23:5</ThemedText>
              </ThemedView>

            </ImageBackground>
          </View>
        }>
        <ThemedView style={styles.titleContainer}>
          <ThemedText type="title">Personal Notes</ThemedText>
        </ThemedView>
        {allNotes.length < 1 && (
          <View style={styles.empty}>
            <View style={{ marginBottom: 20 }}>
              <FontAwesome5 name="gem" size={24} color="white" />
            </View>
            <ThemedText>Your notes will appear here.</ThemedText>
          </View>
        )}
        {allNotes?.length > 0 && allNotes?.map((note, index) => (
          <ThemedView key={index}>
            <Collapsible title={note.title}>
              <View style={styles.actionBtnRow}>
                <Pressable style={styles.actionBtn} onPress={() => handleNoteEditing(note)}>
                  <IconSymbol name='pencil' size={15} color='#baa' />
                </Pressable>
                <Pressable style={styles.actionBtn} onPress={() => handleConfirmDel(note.id)}>
                  <IconSymbol name='trash' size={15} color='#baa' />
                </Pressable>
              </View>
              <ThemedText>
                {note.content}
              </ThemedText>
            </Collapsible>
          </ThemedView>
        ))}

        <DelConfirmModal
          visible={showDelModal}
          onCancel={() => setShowDelModal(false)}
          onDelete={handleNoteDeletion}
        />

        <NoteEditModal
          currentNote={currNote}
          visible={showEditModal}
          onCancel={() => setShowEditModal(false)}
          onEditNote={() => refetch()}
        />

        <NewNoteModal visible={showNoteForm} onCancel={() => setShowNoteForm(false)} onAddNote={() => refetch()} />
      </ParallaxScrollView>
      <AddButton onPress={() => setShowNoteForm(true)} />

    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerImage: {
    color: '#808080',
    bottom: -90,
    left: -35,
    position: 'absolute',
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  empty: {
    flex: 1,
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addBtn: {
    position: 'absolute',
    bottom: 20, // Adjust to place above tab navigation
    right: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#61DAFB',
    borderRadius: 15,
    height: 45,
    width: 45,
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5, // Adds shadow for Android
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 10,
    width: '13%'
  },
  actionBtnRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: -15,
    paddingTop: 0
  },
  headerContainer: {
    marginTop: 42,
    alignItems: 'center',
    justifyContent: 'center'
  },
  topImage: {
    justifyContent: 'center',
    height: 178,
    width: "100%",
  },
  pgTheme: {
    paddingVertical: 3,
    width: '100%',
    bottom: 4
  }
});