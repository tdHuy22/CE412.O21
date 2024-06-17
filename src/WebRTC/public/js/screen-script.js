const hostname = window.location.hostname;
const port = window.location.port;
console.log(hostname, port);
const socket = io(`https://${hostname}:${port}`);

const kitAnnounce = document.getElementById("kit-announce");
const remoteVideo = document.getElementById("screen-video");

let makingOffer = false;
let ignoreOffer = false;
const polite = true;

let payload = {
  description: null,
  candidate: null,
};

const roomName = hostname;

let userMediaStream = null;

let peerConnection = null;

const iceServer = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

socket.emit("UTK-online", roomName);

socket.on("UTK-available", utkAvailable);
socket.on("UTK-error", (roomName) => {
  console.log("UTK is not available: ", roomName);
});
socket.on("user-offline", userLeftKIT);
socket.on("message", onMessage);

function userLeftKIT() {
  console.log("User left KIT: ", roomName);

  if (remoteVideo.srcObject) {
    remoteVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  kitAnnounce.style.display = "block";
  remoteVideo.srcObject = null;

  if (peerConnection) {
    peerConnection.ontrack = null;
    peerConnection.onicecandidate = null;
    peerConnection.close();
  }
}

function utkAvailable() {
  try {
    initRTCPeerConnection();
  } catch (err) {
    console.log(err);
    console.error(err);
  }
}

async function onMessage(payload) {
  console.log("Received payload: ", { payload });
  if (peerConnection.signalingState === "closed") {
    initRTCPeerConnection();
  }
  try {
    if (payload.description) {
      const offerCollision =
        payload.description.type === "offer" &&
        (makingOffer || peerConnection.signalingState !== "stable");
      ignoreOffer = !polite && offerCollision;
      if (ignoreOffer) {
        return;
      }
      await peerConnection.setRemoteDescription(payload.description);
      if (payload.description.type === "offer") {
        await peerConnection.setLocalDescription();
        let localDescription = peerConnection.localDescription;
        payload = {
          description: localDescription,
          candidate: null,
        };
        if (payload) {
          console.log("Sending payload: ", { payload });
          socket.emit("message", payload, roomName);
        }
      }
    } else if (payload.candidate) {
      try {
        let iceCandidate = new RTCIceCandidate(payload.candidate);
        await peerConnection.addIceCandidate(iceCandidate);
      } catch (err) {
        if (!ignoreOffer) {
          throw err;
        }
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function initRTCPeerConnection() {
  peerConnection = new RTCPeerConnection(iceServer);

  peerConnection.onicecandidate = onIceCandidateFunction;
  peerConnection.ontrack = onTrackFunction;
  peerConnection.onnegotiationneeded = onNegotiationNeededFunction;
  peerConnection.oniceconnectionstatechange =
    onIceConnectionStateChangeFunction;
}

function onIceCandidateFunction(event) {
  if (event.candidate) {
    payload = {
      description: null,
      candidate: event.candidate,
    };
    if (payload) {
      console.log("Sending payload: ", { payload });
      socket.emit("message", payload, roomName);
    }
  }
}

function onTrackFunction(event) {
  event.track.onunmute = () => {
    console.log("Received remote track: ", event.track);
    if (remoteVideo.srcObject) return;
    console.log("Received remote stream: ", event.streams[0]);
    remoteVideo.srcObject = event.streams[0];
    kitAnnounce.style.display = "none";
    remoteVideo.onloadedmetadata = () => {
      console.log("Remote video is loaded");
      remoteVideo.play();
    };
  };
}

async function onNegotiationNeededFunction() {
  try {
    makingOffer = true;
    await peerConnection.setLocalDescription();
    var localDescription = peerConnection.localDescription;
    payload = {
      description: localDescription,
      candidate: null,
    };
    if (payload) {
      console.log("Sending payload: ", { payload });
      socket.emit("message", payload, roomName);
    }
  } catch (err) {
    console.error(err);
  } finally {
    makingOffer = false;
  }
}

function onIceConnectionStateChangeFunction() {
  console.log(
    "Ice connection state change: ",
    peerConnection.iceConnectionState
  );
  if (peerConnection.iceConnectionState === "failed") {
    peerConnection.restartIce();
  }
}
