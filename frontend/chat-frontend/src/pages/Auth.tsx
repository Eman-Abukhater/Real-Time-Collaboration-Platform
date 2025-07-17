import { useState } from "react";
import { Button, TextField, Box, Typography, Paper, Alert } from "@mui/material";
import { gql, useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { connectSocket } from "../socket";
import { ApolloError } from "@apollo/client"; // Importing ApolloError type

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
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const [register] = useMutation(REGISTER);
  const [login] = useMutation(LOGIN);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrorMessage(null); // Clear errors on change
  };

  const handleSubmit = async () => {
    try {
      setErrorMessage(null);
      setSuccessMessage(null);

      if (isLogin) {
        const { data } = await login({
          variables: { email: form.email, password: form.password },
        });

        const token = data.login.token;
        const userId = data.login.user.id;

        localStorage.setItem("token", token);
        localStorage.setItem("userId", userId);

        connectSocket(userId);
        navigate("/chat");
      } else {
        await register({ variables: form });

        setSuccessMessage("Registration successful! Please log in.");
        setIsLogin(true); // Switch to login mode
        setForm({ username: "", email: "", password: "" }); // Clear form
      }
    } catch (err) {
      if (err instanceof ApolloError) {
        setErrorMessage(err.message); // ApolloError-specific handling
      } else if (err instanceof Error) {
        setErrorMessage(err.message); // General error handling
      } else {
        setErrorMessage("An unknown error occurred.");
      }
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
      <Paper elevation={4} sx={{ padding: 4, width: 400 }}>
        <Typography variant="h5" textAlign="center" gutterBottom>
          {isLogin ? "Login" : "Register"}
        </Typography>

        {errorMessage && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {successMessage}
          </Alert>
        )}

        {!isLogin && (
          <TextField
            name="username"
            label="Username"
            fullWidth
            margin="normal"
            onChange={handleChange}
            value={form.username}
          />
        )}

        <TextField
          name="email"
          label="Email"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.email}
        />

        <TextField
          name="password"
          label="Password"
          type="password"
          fullWidth
          margin="normal"
          onChange={handleChange}
          value={form.password}
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
          onClick={() => {
            setIsLogin(!isLogin);
            setErrorMessage(null);
            setSuccessMessage(null);
          }}
        >
          {isLogin ? "Need to register?" : "Already have an account?"}
        </Button>
      </Paper>
    </Box>
  );
}
