import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from 'react';
import io from 'socket.io-client';
import {Platform} from 'react-native';

// Create WebSocket Context
const WebSocketContext = createContext();

// Network configuration for different environments
const getServerUrl = () => {
  if (Platform.OS === 'android') {
    // For Android emulator, use your machine's actual IP address
    // 10.0.2.2 is for accessing localhost, but your server is on 192.168.0.100
    return 'http://192.168.0.100:3002';
  } else if (Platform.OS === 'ios') {
    // For iOS simulator, use your machine's IP address as well
    return 'http://192.168.0.100:3002';
  } else {
    // Fallback to your current IP
    return 'http://192.168.0.100:3002';
  }
};

const BaseUrl = getServerUrl();

// Custom hook to use WebSocket context
export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};

// WebSocket Provider Component
export const WebSocketProvider = ({children, serverUrl = BaseUrl}) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const [messages, setMessages] = useState([]);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const eventListeners = useRef({});

  console.log('Attempting to connect to WebSocket server:', serverUrl);

  // Initialize socket connection
  useEffect(() => {
    const socketInstance = io(serverUrl, {
      transports: ['polling'], // Start with polling only for better React Native compatibility
      timeout: 30000, // Increase timeout
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 3000,
      reconnectionDelayMax: 10000,
      forceNew: true,
      // Remove problematic options and add React Native-specific ones
      autoConnect: true,
      upgrade: false, // Disable upgrade to websocket for now
      rememberUpgrade: false,
      // React Native specific options
      jsonp: false,
      withCredentials: false,
      // Add query parameters for debugging
      query: {
        platform: Platform.OS,
        transport: 'polling',
      },
    });

    // Connection event handlers
    socketInstance.on('connect', () => {
      console.log('✅ Socket connected successfully:', socketInstance.id);
      console.log('Transport used:', socketInstance.io.engine.transport.name);
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
    });

    socketInstance.on('disconnect', reason => {
      console.log('❌ Socket disconnected:', reason);
      setIsConnected(false);
    });

    socketInstance.on('connect_error', error => {
      console.error('🔴 Socket connection error:', error.message);
      console.error('Error type:', error.type);
      console.error('Error description:', error.description);
      console.error('Error context:', error.context);
      console.error('Full error object:', JSON.stringify(error, null, 2));

      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnected(false);
      setReconnectAttempts(prev => {
        const newAttempts = prev + 1;
        // Log additional debugging info
        console.log('Server URL attempted:', serverUrl);
        console.log('Platform:', Platform.OS);
        console.log('Reconnect attempts:', newAttempts);
        console.log('Error details for debugging:');
        console.log('- Check if server is running on', serverUrl);
        console.log('- Check CORS configuration in backend');
        console.log('- Verify network connectivity');
        return newAttempts;
      });
    });

    socketInstance.on('reconnect', attemptNumber => {
      console.log('✅ Socket reconnected after', attemptNumber, 'attempts');
      setIsConnected(true);
      setConnectionError(null);
      setReconnectAttempts(0);
    });

    socketInstance.on('reconnect_error', error => {
      console.error('🔴 Socket reconnection error:', error.message);
      setConnectionError(`Reconnection failed: ${error.message}`);
    });

    socketInstance.on('reconnect_failed', () => {
      console.error('💀 Socket reconnection failed permanently');
      setConnectionError(
        'Unable to connect to server. Please check your network connection.',
      );
    });

    setSocket(socketInstance);

    // Cleanup on unmount
    return () => {
      console.log('🧹 Cleaning up socket connection');
      socketInstance.disconnect();
    };
  }, [serverUrl]);

  // Function to emit events
  const emit = (event, data, callback) => {
    if (socket && isConnected) {
      if (callback) {
        socket.emit(event, data, callback);
      } else {
        socket.emit(event, data);
      }
    } else {
      console.warn('Socket not connected. Cannot emit event:', event);
    }
  };

  // Function to listen to events
  const on = (event, callback) => {
    if (socket) {
      socket.on(event, callback);

      // Store listener for cleanup
      if (!eventListeners.current[event]) {
        eventListeners.current[event] = [];
      }
      eventListeners.current[event].push(callback);
    }
  };

  // Function to remove event listeners
  const off = (event, callback) => {
    if (socket) {
      socket.off(event, callback);

      // Remove from stored listeners
      if (eventListeners.current[event]) {
        eventListeners.current[event] = eventListeners.current[event].filter(
          listener => listener !== callback,
        );
      }
    }
  };

  // Function to remove all listeners for an event
  const removeAllListeners = event => {
    if (socket) {
      socket.removeAllListeners(event);
      delete eventListeners.current[event];
    }
  };

  // Function to manually connect
  const connect = () => {
    if (socket && !isConnected) {
      socket.connect();
    }
  };

  // Function to manually disconnect
  const disconnect = () => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  };

  // Function to join a room
  const joinRoom = (roomId, callback) => {
    emit('join-room', {roomId}, callback);
  };

  // Function to leave a room
  const leaveRoom = (roomId, callback) => {
    emit('leave-room', {roomId}, callback);
  };

  // Function to send a message
  const sendMessage = (message, roomId = null) => {
    const messageData = {
      message,
      timestamp: new Date().toISOString(),
      roomId,
    };

    emit('message', messageData);

    // Add to local messages
    setMessages(prev => [...prev, {...messageData, sender: 'me'}]);
  };

  // Listen for incoming messages
  useEffect(() => {
    if (socket) {
      const handleMessage = data => {
        setMessages(prev => [...prev, {...data, sender: 'other'}]);
      };

      socket.on('message', handleMessage);

      return () => {
        socket.off('message', handleMessage);
      };
    }
  }, [socket]);

  const contextValue = {
    // Connection state
    socket,
    isConnected,
    connectionError,

    // Core methods
    emit,
    on,
    off,
    removeAllListeners,

    // Connection management
    connect,
    disconnect,

    // Room management
    joinRoom,
    leaveRoom,

    // Messaging
    sendMessage,
    messages,
    setMessages,

    // Utility
    socketId: socket?.id,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

// Optional: Higher-order component for class components
export const withWebSocket = Component => {
  return props => (
    <WebSocketContext.Consumer>
      {webSocketContext => (
        <Component {...props} webSocket={webSocketContext} />
      )}
    </WebSocketContext.Consumer>
  );
};

export default WebSocketProvider;
