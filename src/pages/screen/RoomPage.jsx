


import React, { useEffect, useCallback, useState } from "react";
import ReactPlayer from "react-player";
import peer from "../../lib/peer";
import { getSocket } from "../../socket";
import { Box, Button, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { Audiotrack, Call, VideoCall } from "@mui/icons-material";
// import {} from "@mui/icons-material";

const RoomPage = () => {
 
 

  const socket = getSocket();
  const navigate = useNavigate();
  const [offCallBtn, setOffCallBtn] = useState(true);
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState();
  const [remoteStream, setRemoteStream] = useState();

  const [audioStream, setAudioStream] = useState(true);
  const [videoStream, setVideoStream] = useState(true);

  const handleUserJoined = useCallback(({ email, id }) => {
    // console.log(`Email ${email} joined room`);
    setRemoteSocketId(id);
  }, []);

  const handleCallUser = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: audioStream,
      video: videoStream,
    });
    
    const offer = await peer.getOffer();
    socket.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncommingCall = useCallback(
    async ({ from, offer }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  

  const sendStreams = useCallback(() => {
    for (const track of myStream.getTracks()) {
      peer.peer.addTrack(track, myStream);
    }
  }, [myStream]);

  const handleCallAccepted = useCallback(
    ({ from, ans }) => {
       peer.setLocalDescription(ans);
      console.log("Call Accepted!");
      sendStreams();
    },
    [sendStreams]
  );

  const handleNegoNeeded = useCallback(async () => {
    const offer = await peer.getOffer();
    socket.emit("peer:nego:needed", { offer, to: remoteSocketId });
  }, [remoteSocketId, socket]);

  useEffect(() => {
    peer.peer.addEventListener("negotiationneeded", handleNegoNeeded);
    return () => {
      peer.peer.removeEventListener("negotiationneeded", handleNegoNeeded);
    };
  }, [handleNegoNeeded]);

  const handleNegoNeedIncomming = useCallback(
    async ({ from, offer }) => {
      const ans = await peer.getAnswer(offer);
      socket.emit("peer:nego:done", { to: from, ans });
    },
    [socket]
  );

  const handleNegoNeedFinal = useCallback(async ({ ans }) => {
    await peer.setLocalDescription(ans);
    setOffCallBtn(false);
  }, []);


  const handleHangUpButton = useCallback(async() => {
    if (myStream) {
      myStream.getTracks().forEach((track) => track.stop());
    }
    setMyStream(null);
    setRemoteStream(null);
    setRemoteSocketId(null);
    
    navigate("/lobby");
    socket.emit("call:ended", { to: remoteSocketId });
  }, [myStream, remoteSocketId, socket]);

  // console.log("remote stream", remoteStream);
  // console.log("my stream", myStream);
  
    const handleHangUp = useCallback( () => {
      setRemoteStream(null);
      setRemoteSocketId(null);
    }, [setRemoteSocketId, setRemoteStream]);

  useEffect(() => {
    peer.peer.addEventListener("track", async (ev) => {
      const remoteStream = ev.streams;
      console.log("GOT TRACKS!!");
      setRemoteStream(remoteStream[0]);
    });
  }, []);

  useEffect(() => {
    socket.on("user:joined", handleUserJoined);
    socket.on("incomming:call", handleIncommingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:nego:needed", handleNegoNeedIncomming);
    socket.on("peer:nego:final", handleNegoNeedFinal);
    socket.off("call:ended",handleHangUp);


    return () => {
      socket.off("user:joined", handleUserJoined);
      socket.off("incomming:call", handleIncommingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:nego:needed", handleNegoNeedIncomming);
      socket.off("peer:nego:final", handleNegoNeedFinal);
      socket.off("call:ended",handleHangUp);
    };
  }, [
    socket,
    handleUserJoined,
    handleIncommingCall,
    handleCallAccepted,
    handleNegoNeedIncomming,
    handleNegoNeedFinal,
  ]);

  // const handleAudio = ()=>{
  //   console.log("yea it is working");
    
  //   setAudioStream(prev=>!prev)
  // };
  // const handleVideo = ()=>{
  //   setVideoStream((prev) => !prev);
  // if (!videoStream) {
  //   navigator.mediaDevices.getUserMedia({ video: true })
  //     .then((stream) => {
  //       setMyStream(stream);
  //     })
  //     .catch((err) => {
  //       console.error(err);
  //     });
  // } else {
  //   myStream.getTracks().forEach((track) => track.stop());
  //   setMyStream(null);
  // }
  // };
  

  return(
    <Box sx={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', backgroundColor:"black", color:"white" }}>
      {offCallBtn &&(
        <>
         <Typography variant="h3" sx={{ marginBottom: 2 }}>
        Room Page
      </Typography>
      <Typography variant="h4" sx={{ marginBottom: 4 }}>
        {remoteSocketId ? "Connected" : "No one in room"}
      </Typography>
      {myStream && (
        <Button variant="contained" onClick={sendStreams} sx={{ marginBottom: 2 }}>
          Send Stream
        </Button>
      )}
      
      {remoteSocketId && (
        <Button variant="contained" onClick={handleCallUser} sx={{ marginBottom: 4 }}>
          CALL
        </Button>
      )}
      </>
      )
      }
      


      {myStream && (
        <Box sx={{ position: 'fixed', top: 0, right: 0 }}>
          <ReactPlayer
            playing
            muted
            width={"150px"}
            height={"150px"}
            url={myStream}
          />
        </Box>
      )}
      {remoteStream && (
        <Box sx={{ height: '100vh', width: '100%' }}>
          <ReactPlayer
            playing
            // muted
            height="100%"
            width="100vw"
            url={remoteStream}
          />
        </Box>
      )}
      {myStream && (
        <>
        {/* <Box sx={{width:"300px",position:"fixed",position: 'fixed', bottom:60, display:"flex", alignItems:"center", justifyContent:"space-evenly"}}>
          
        <VideoCall sx={{ backgroundColor:"gray", width:"50px", height:"50px", padding:"10px", borderRadius:"50%"}} onClick={handleVideo}/>
        <Call sx={{ backgroundColor:"gray", width:"50px", height:"50px", padding:"10px", borderRadius:"50%"}}  onClick={handleAudio}/>
        </Box> */}
        <Button variant="outlined"  onClick={handleHangUpButton} sx={{ marginBottom: 2 ,position: 'fixed', right:'45%', bottom:0, backgroundColor:"red", borderRadius:"30%"}}>
          <Call  sx={{color:"white"}} />
      </Button>
      </>
   
  )}
    </Box>
  );

  
};

export default RoomPage;


