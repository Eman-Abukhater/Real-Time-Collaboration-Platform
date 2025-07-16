import { useState } from "react";
import { Button, TextField, Box, Typography, Paper } from "@mui/material";
import { gql, useMutation } from "@apollo/client";

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
        localStorage.setItem("token", data.login.token);
        alert("Login successful");
      } else {
        const { data } = await register({ variables: form });
        localStorage.setItem("token", data.register.token);
        alert("Registration successful");
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
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="100vh"
    >
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
