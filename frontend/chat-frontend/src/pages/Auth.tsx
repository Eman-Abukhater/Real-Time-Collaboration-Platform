import { useState } from "react";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket"; // ✅ use this only

const REGISTER = gql`
  mutation Register($username: String!, $email: String!, $password: String!) {
    register(username: $username, email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export default function Auth() {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: "", email: "", password: "" });

  const [register] = useMutation(REGISTER);
  const [login] = useMutation(LOGIN);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    try {
      if (isLogin) {
        const { data } = await login({
          variables: { email: form.email, password: form.password },
        });

        const token = data.login.token;
        const userId = data.login.user.id;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);

        connectSocket(userId); // ✅ Connect with userId
        navigate("/chat");

      } else {
        const { data } = await register({ variables: form });

        const token = data.register.token;
        const userId = data.register.user.id;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);

        connectSocket(userId); // ✅ Connect with userId
        navigate("/chat");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error("Unknown error occurred");
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={4} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {isLogin ? "Login" : "Register"}
        </Typography>

        {!isLogin && (
          <TextField
            name="username"
            label="Username"
            fullWidth
            margin="normal"
            onChange={handleChange}
          />
        )}

        <TextField
          name="email"
          label="Email"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
        />

        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={handleSubmit}
          disabled={
            isLogin
              ? !(form.email && form.password)
              : !(form.username && form.email && form.password)
          }
        >
          {isLogin ? "Login" : "Register"}
        </Button>

        <Button
          color="secondary"
          fullWidth
          sx={{ mt: 1 }}
          onClick={() => setIsLogin(!isLogin)}
        >
          {isLogin ? "Need to register?" : "Already have an account?"}
        </Button>
      </Paper>
    </Box>
  );
}
