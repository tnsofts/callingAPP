// import React, {useEffect, useState} from 'react';
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   ScrollView,
//   StyleSheet,
//   Alert,
// } from 'react-native';
// import {useWebSocket} from '../screens/WebScoket';

// const WebSocketExample = () => {
//   const {
//     socket,
//     isConnected,
//     connectionError,
//     emit,
//     on,
//     off,
//     sendMessage,
//     messages,
//     joinRoom,
//     leaveRoom,
//     socketId,
//   } = useWebSocket();

//   const [inputMessage, setInputMessage] = useState('');
//   const [roomId, setRoomId] = useState('general');

//   useEffect(() => {
//     // Example: Listen for custom events
//     const handleCustomEvent = data => {
//       console.log('Custom event received:', data);
//       Alert.alert('Custom Event', `Received: ${JSON.stringify(data)}`);
//     };

//     // Add event listener
//     on('registerDevice', handleCustomEvent);

//     // Cleanup listener on unmount
//     return () => {
//       off('registerDevice', handleCustomEvent);
//     };
//   }, [on, off]);

//   const handleSendMessage = () => {
//     if (inputMessage.trim()) {
//       sendMessage(inputMessage, roomId);
//       setInputMessage('');
//     }
//   };

//   const handleJoinRoom = () => {
//     joinRoom(roomId, response => {
//       console.log('Joined room response:', response);
//       Alert.alert('Room', `Joined room: ${roomId}`);
//     });
//   };

//   const handleLeaveRoom = () => {
//     leaveRoom(roomId, response => {
//       console.log('Left room response:', response);
//       Alert.alert('Room', `Left room: ${roomId}`);
//     });
//   };

//   const handleCustomEmit = () => {
//     emit('custom-event', {
//       message: 'Hello from mobile app!',
//       timestamp: new Date().toISOString(),
//     });
//   };

//   return (
//     <View style={styles.container}>
//       <Text style={styles.title}>WebSocket Example</Text>

//       {/* Connection Status */}
//       <View style={styles.statusContainer}>
//         <Text style={styles.statusLabel}>Status:</Text>
//         <Text
//           style={[styles.statusText, {color: isConnected ? 'green' : 'red'}]}>
//           {isConnected ? 'Connected' : 'Disconnected'}
//         </Text>
//       </View>

//       {connectionError && (
//         <Text style={styles.errorText}>Error: {connectionError}</Text>
//       )}

//       {socketId && <Text style={styles.socketId}>Socket ID: {socketId}</Text>}

//       {/* Room Management */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Room Management</Text>
//         <TextInput
//           style={styles.input}
//           value={roomId}
//           onChangeText={setRoomId}
//           placeholder="Room ID"
//         />
//         <View style={styles.buttonRow}>
//           <TouchableOpacity style={styles.button} onPress={handleJoinRoom}>
//             <Text style={styles.buttonText}>Join Room</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.button, styles.secondaryButton]}
//             onPress={handleLeaveRoom}>
//             <Text style={styles.buttonText}>Leave Room</Text>
//           </TouchableOpacity>
//         </View>
//       </View>

//       {/* Messaging */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Send Message</Text>
//         <TextInput
//           style={styles.input}
//           value={inputMessage}
//           onChangeText={setInputMessage}
//           placeholder="Type your message..."
//           multiline
//         />
//         <TouchableOpacity style={styles.button} onPress={handleSendMessage}>
//           <Text style={styles.buttonText}>Send Message</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Custom Events */}
//       <View style={styles.section}>
//         <Text style={styles.sectionTitle}>Custom Events</Text>
//         <TouchableOpacity style={styles.button} onPress={handleCustomEmit}>
//           <Text style={styles.buttonText}>Emit Custom Event</Text>
//         </TouchableOpacity>
//       </View>

//       {/* Messages */}
//       <View style={styles.messagesSection}>
//         <Text style={styles.sectionTitle}>Messages ({messages.length})</Text>
//         <ScrollView style={styles.messagesContainer}>
//           {messages.map((msg, index) => (
//             <View
//               key={index}
//               style={[
//                 styles.messageItem,
//                 msg.sender === 'me' ? styles.myMessage : styles.otherMessage,
//               ]}>
//               <Text style={styles.messageText}>{msg.message}</Text>
//               <Text style={styles.messageTime}>
//                 {new Date(msg.timestamp).toLocaleTimeString()}
//               </Text>
//             </View>
//           ))}
//         </ScrollView>
//       </View>
//     </View>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     padding: 20,
//     backgroundColor: '#f5f5f5',
//   },
//   title: {
//     fontSize: 24,
//     fontWeight: 'bold',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   statusContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 10,
//   },
//   statusLabel: {
//     fontSize: 16,
//     fontWeight: '600',
//     marginRight: 10,
//   },
//   statusText: {
//     fontSize: 16,
//     fontWeight: 'bold',
//   },
//   errorText: {
//     color: 'red',
//     fontSize: 14,
//     marginBottom: 10,
//   },
//   socketId: {
//     fontSize: 12,
//     color: '#666',
//     marginBottom: 20,
//   },
//   section: {
//     backgroundColor: 'white',
//     padding: 15,
//     borderRadius: 10,
//     marginBottom: 15,
//   },
//   sectionTitle: {
//     fontSize: 18,
//     fontWeight: '600',
//     marginBottom: 10,
//   },
//   input: {
//     borderWidth: 1,
//     borderColor: '#ddd',
//     borderRadius: 8,
//     padding: 12,
//     fontSize: 16,
//     marginBottom: 10,
//   },
//   buttonRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//   },
//   button: {
//     backgroundColor: '#007AFF',
//     padding: 12,
//     borderRadius: 8,
//     alignItems: 'center',
//     flex: 1,
//     marginRight: 5,
//   },
//   secondaryButton: {
//     backgroundColor: '#FF3B30',
//     marginLeft: 5,
//     marginRight: 0,
//   },
//   buttonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//   },
//   messagesSection: {
//     flex: 1,
//     backgroundColor: 'white',
//     borderRadius: 10,
//     padding: 15,
//   },
//   messagesContainer: {
//     flex: 1,
//   },
//   messageItem: {
//     padding: 10,
//     marginVertical: 5,
//     borderRadius: 8,
//   },
//   myMessage: {
//     backgroundColor: '#007AFF',
//     alignSelf: 'flex-end',
//     maxWidth: '80%',
//   },
//   otherMessage: {
//     backgroundColor: '#E5E5EA',
//     alignSelf: 'flex-start',
//     maxWidth: '80%',
//   },
//   messageText: {
//     fontSize: 16,
//     color: 'white',
//   },
//   messageTime: {
//     fontSize: 12,
//     color: 'rgba(255,255,255,0.7)',
//     marginTop: 5,
//   },
// });

// export default WebSocketExample;
