import { useInputValidation } from "6pp";
import React from "react";
import { bgGradient } from "../../constants/color";
import { Container } from "@mui/system";
import { Button, Paper, TextField, Typography } from "@mui/material";
import { getSocket } from "../../socket";
import { useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const LobbyPage = () => {
  const socket = getSocket();
  const navigate = useNavigate();

  const email = useInputValidation("");
  const roomNo = useInputValidation("");

  const handleSubmit = useCallback(
    (e) => {
      e.preventDefault();
      socket.emit("room:join", { email: email.value, room: roomNo.value });
    },
    [email, roomNo, socket]
  );

  const handleJoinRoom = useCallback(
    (data) => {
      const { email, room } = data;
      navigate(`/room/${room}`);
    },
    [navigate]
  );

  useEffect(() => {
    socket.on("room:join", handleJoinRoom);
    return () => {
      socket.off("room:join", handleJoinRoom);
    };
  }, [socket, handleJoinRoom]);

  return (
    <div
      style={{
        backgroundImage: bgGradient,
      }}
    >
      <Container
        component={"main"}
        maxWidth="xs"
        sx={{
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* Instructions for the user */}
          <Typography variant="h5">Call</Typography>
          <Typography
            variant="body1"
            sx={{ marginBottom: 4, textAlign: "start" }}
          >
            To connect with someone:
            <ol>
              <li>Enter your Name.</li>
              <li>Input the room number you wish to join.</li>
              <li>Click "Join" to connect.</li>
              <li>
                Make sure the other person is in the same room to communicate.
              </li>
            </ol>
          </Typography>

          <form
            style={{
              width: "100%",
              marginTop: "1rem",
            }}
            onSubmit={handleSubmit}
          >
            <TextField
              required
              fullWidth
              label="Name"
              type="Name"
              margin="normal"
              variant="outlined"
              value={email.value}
              onChange={email.changeHandler}
            />

            <TextField
              required
              fullWidth
              label="room no"
              type="text"
              margin="normal"
              variant="outlined"
              value={roomNo.value}
              onChange={roomNo.changeHandler}
            />

            <Button
              sx={{
                marginTop: "1rem",
              }}
              variant="contained"
              color="primary"
              type="submit"
              fullWidth
            >
              Join
            </Button>
          </form>
        </Paper>
      </Container>
    </div>
  );
};

export default LobbyPage;
