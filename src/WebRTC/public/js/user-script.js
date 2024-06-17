const hostname = window.location.hostname;
const port = window.location.port;
console.log(hostname, port);
const socket = io(`https://${hostname}:${port}`);

const videoChatForm = document.getElementById("video-chat-form");
const videoChatRooms = document.getElementById("video-chat-rooms");

const roomInput = document.getElementById("roomName");
const localVideo = document.getElementById("user-video");
const joinButton = document.getElementById("join");

const btnGroup = document.getElementsByClassName("btn-group");
const audioButton = document.getElementById("audioButton");
const stopButton = document.getElementById("stopSharingButton");
const leaveButton = document.getElementById("leaveButton");
const startSharingButton = document.getElementById("startSharingButton");

var offFlag = false;
var stopFlag = false;

var makingOffer = false;
var ignoreOffer = false;
const polite = true;

var payload = {
  description: null,
  candidate: null,
};

var roomName = null;
var userMediaStream = null;

var peerConnection = null;

const iceServer = {
  iceServers: [
    { urls: "stun:stun.services.mozilla.com" },
    { urls: "stun:stun.l.google.com:19302" },
  ],
};

const displayConstraints = {
  video: {
    width: { max: 1280 },
    height: { max: 720 },
  },
  cursor: "always",
  audio: true,
};

function userAccessSuccess() {
  initRTCPeerConnection();

  videoChatForm.style.display = "none";
  btnGroup[0].style.display = "flex";
  startSharingButton.style.display = "block";
}

startSharingButton.addEventListener("click", async () => {
  if (peerConnection) {
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia(
        displayConstraints
      );
      userMediaStream = stream;
      userMediaStream.getTracks().forEach((track) => {
        console.log("Adding track: ", track);
        peerConnection.addTrack(track, userMediaStream);
      });
      localVideo.srcObject = stream;
      localVideo.onloadedmetadata = () => {
        localVideo.play();
      };
      startSharingButton.style.display = "none";
    } catch (err) {
      alert("Please allow access to media devices");
      console.log(err);
      console.error(err);
    }
  }
});

joinButton.addEventListener("click", () => {
  if (roomInput.value === "") {
    alert("Please enter a room name");
  } else {
    roomName = roomInput.value;
    socket.emit("user-online", roomName);
    console.log("User access to KIT: ", roomName);
  }
});

audioButton.addEventListener("click", () => {
  if (!offFlag) {
    userMediaStream.getAudioTracks().forEach((track) => {
      track.enabled = false;
    });
    offFlag = true;
    audioButton.innerHTML = "Audio On";
  } else {
    userMediaStream.getAudioTracks().forEach((track) => {
      track.enabled = true;
    });
    offFlag = false;
    audioButton.innerHTML = "Audio Off";
  }
});

stopButton.addEventListener("click", () => {
  if (!stopFlag) {
    userMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = false;
    });
    stopFlag = true;
    stopButton.innerHTML = "Start Sharing";
  } else {
    userMediaStream.getVideoTracks().forEach((track) => {
      track.enabled = true;
    });
    stopFlag = false;
    stopButton.innerHTML = "Stop Sharing";
  }
});

leaveButton.addEventListener("click", () => {
  socket.emit("user-offline", roomName);
  console.log("User left KIT: ", roomName);

  videoChatForm.style.display = "block";
  btnGroup[0].style.display = "none";

  if (localVideo.srcObject) {
    localVideo.srcObject.getTracks().forEach((track) => {
      track.stop();
    });
  }

  localVideo.srcObject = null;

  if (peerConnection) {
    peerConnection.onicecandidate = null;
    peerConnection.ontrack = null;
    peerConnection.close();
  }
});

socket.on("user-access-success", userAccessSuccess);
socket.on("kit-not-available", (roomName) => {
  console.log("KIT not available: ", roomName);
  alert("KIT not available: " + roomName);
});
socket.on("kit-used", (roomName) => {
  console.log("KIT is being used: ", roomName);
  alert("KIT is being used: " + roomName);
});
socket.on("message", onMessage);

async function onMessage(payload) {
  console.log("Received payload: ", { payload });
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
        var localDescription = peerConnection.localDescription;
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
        var iceCandidate = new RTCIceCandidate(payload.candidate);
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
      // console.log("Sending payload: ", { payload });
      socket.emit("message", payload, roomName);
    }
  }
}

function onTrackFunction(event) {
  event.track.onunmute = () => {
    console.log("Received remote track: ", event.track);
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
