import React, { useState, type ChangeEvent, type FormEvent } from "react";
import {
    Box,
    Container,
    Paper,
    Typography,
    TextField,
    Button
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { useSnackbar } from "../context/SnackbarContext";

interface LoginForm {
    username: string;
    password: string;
}

const LoginPage: React.FC = () => {
    const [form, setForm] = useState<LoginForm>({ username: "", password: "" });
    const [loading, setLoading] = useState(false);

    const snackbar = useSnackbar();
    const navigate = useNavigate();

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!form.username || !form.password) {
            snackbar.showSnackbar("All fields are required", "error");
            return;
        }

        setLoading(true);

        axiosClient
            .post(
                "/api/expense-tracker/auth/login", 
                form,
                {
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded"
                    }
                }
            )
            .then((res) => {
                const msg = res?.data?.message || "Login successful";
                snackbar.showSnackbar(msg, "success");

                navigate("/dashboard");
            })
            .catch((err: any) => {
                const serverMsg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Login failed. Check credentials.";
                snackbar.showSnackbar(serverMsg, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    };


    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                width: "100%",
                height: "100vh",
            }}
        >
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Login
                    </Typography>

                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            autoComplete="username"
                        />

                        <TextField
                            label="Password"
                            name="password"
                            type="password"
                            value={form.password}
                            onChange={handleChange}
                            fullWidth
                            margin="normal"
                            autoComplete="current-password"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ mt: 3 }}
                            disabled={loading}
                        >
                            {loading ? "Logging in..." : "Login"}
                        </Button>

                        <Button
                            fullWidth
                            sx={{ mt: 1 }}
                            variant="text"
                            onClick={() => navigate("/register")}
                        >
                            Don't have an account? Create one
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default LoginPage;
