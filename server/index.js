const WebSocket = require('ws');
const wss = new WebSocket.Server({ port: 8080 });

const rooms = {}; // Maps room IDs to peer connections

wss.on('connection', ws => {
  let peerId;
  let roomId;

  ws.on('message', message => {
    const data = JSON.parse(message);

    switch (data.type) {
      case 'join':
        handleJoin(data, ws);
        break;
      case 'chat-message':
        handleMessage(data);
        break;
      case 'peer-disconnected':
        handlePeerDisconnection(data);
        break;
      default:
        console.error('Unknown message type:', data.type);
    }
  });

  ws.on('close', () => {
    if (peerId && roomId) {
      handlePeerDisconnection({ peerId, roomId });
    }
  });

  function handleJoin(data, ws) {
    peerId = generatePeerId();
    roomId = data.room;

    if (!rooms[roomId]) {
      rooms[roomId] = {};
    }
    rooms[roomId][peerId] = ws;

    // Get the list of existing peers in the room
    const existingPeers = Object.keys(rooms[roomId]).filter(id => id !== peerId);

    // Send the joined message with the list of existing peers
    ws.send(JSON.stringify({ 
      type: 'joined', 
      peerId, 
      peers: existingPeers
    }));

    // Notify existing peers in the room about the new peer
    broadcast(roomId, { type: 'new-peer', peerId }, [peerId]);
  }

  function handleMessage(data) {
    const { content, sender } = data;
    broadcast(roomId, { type: 'chat-message', content, sender });
  }

  function handlePeerDisconnection(data) {
    const { peerId: disconnectedPeerId } = data;
    if (rooms[roomId] && rooms[roomId][disconnectedPeerId]) {
      delete rooms[roomId][disconnectedPeerId];
      if (Object.keys(rooms[roomId]).length === 0) {
        delete rooms[roomId];
      }
      broadcast(roomId, { type: 'peer-disconnected', peerId: disconnectedPeerId });
    }
  }

  function broadcast(roomId, message, excludePeerIds = []) {
    if (rooms[roomId]) {
      for (const [id, peer] of Object.entries(rooms[roomId])) {
        if (!excludePeerIds.includes(id)) {
          peer.send(JSON.stringify(message));
        }
      }
    }
  }

  function generatePeerId() {
    return Math.random().toString(36).substr(2, 9);
  }
});
