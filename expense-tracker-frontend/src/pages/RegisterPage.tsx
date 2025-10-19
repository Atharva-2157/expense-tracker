import React, { useState, type ChangeEvent, type FormEvent } from "react";
import {
    Container,
    Paper,
    Typography,
    TextField,
    Button,
    Box
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";
import { USERNAME_REGEX, EMAIL_REGEX, PASSWORD_REGEX } from "../constants";
import { useSnackbar } from "../context/SnackbarContext";

interface RegisterForm {
    username: string;
    email: string;
    password: string;
    confirmPassword: string;
}

const RegisterPage: React.FC = () => {
    const [form, setForm] = useState<RegisterForm>({
        username: "",
        email: "",
        password: "",
        confirmPassword: "",
    });

    const [errors, setErrors] = useState<Partial<RegisterForm>>({});
    const [loading, setLoading] = useState(false);

    const snackbar = useSnackbar();
    const navigate = useNavigate();

    const validate = (): boolean => {
        const errs: Partial<RegisterForm> = {};

        if (!form.username.trim()) {
            errs.username = "Username is required";
        } else if (!USERNAME_REGEX.test(form.username)) {
            errs.username = "Username must be 4–24 characters (letters, numbers, underscores only)";
        }

        if (!form.email.trim()) {
            errs.email = "Email is required";
        } else if (!EMAIL_REGEX.test(form.email)) {
            errs.email = "Enter a valid email address";
        }

        if (!form.password) {
            errs.password = "Password is required";
        } else if (!PASSWORD_REGEX.test(form.password)) {
            errs.password =
                "Password must be at least 8 characters with 1 uppercase, 1 lowercase, 1 number, and 1 special character";
        }

        if (form.password !== form.confirmPassword) {
            errs.confirmPassword = "Passwords do not match";
        }

        setErrors(errs);
        return Object.keys(errs).length === 0;
    };


    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => ({ ...prev, [name]: undefined }));
    };


    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!validate()) return;

        setLoading(true);

        const payload = {
            username: form.username.trim(),
            email: form.email.trim(),
            password: form.password,
        };

        axiosClient
            .post(
                "/api/expense-tracker/auth/register",
                payload,
            )
            .then((res) => {
                const msg = res?.data?.message || "Registered successfully";
                snackbar.showSnackbar(msg, "success");
                navigate("/login");
            })
            .catch((err: any) => {
                const serverMsg =
                    err?.response?.data?.message ||
                    err?.response?.data?.error ||
                    "Registration failed. Try again.";
                snackbar.showSnackbar(serverMsg, "error");
            })
            .finally(() => {
                setLoading(false);
            });
    };


    return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: "100vh",
        }}>
            <Container maxWidth="sm">
                <Paper elevation={3} sx={{ p: 4 }}>
                    <Typography variant="h5" component="h1" gutterBottom>
                        Create an account
                    </Typography>

                    <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                        <TextField
                            label="Username"
                            name="username"
                            value={form.username}
                            onChange={handleChange}
                            error={!!errors.username}
                            helperText={errors.username}
                            fullWidth
                            margin="normal"
                            autoComplete="username"
                        />

                        <TextField
                            label="Email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            fullWidth
                            margin="normal"
                            autoComplete="email"
                        />

                        <TextField
                            label="Password"
                            name="password"
                            value={form.password}
                            onChange={handleChange}
                            error={!!errors.password}
                            helperText={errors.password}
                            type="password"
                            fullWidth
                            margin="normal"
                            autoComplete="new-password"
                        />

                        <TextField
                            label="Confirm Password"
                            name="confirmPassword"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            error={!!errors.confirmPassword}
                            helperText={errors.confirmPassword}
                            type="password"
                            fullWidth
                            margin="normal"
                            autoComplete="new-password"
                        />

                        <Button
                            type="submit"
                            variant="contained"
                            size="large"
                            fullWidth
                            sx={{ mt: 3 }}
                            disabled={loading}
                        >
                            {loading ? "Registering..." : "Register"}
                        </Button>

                        <Button
                            fullWidth
                            sx={{ mt: 1 }}
                            onClick={() => navigate("/login")}
                            variant="text"
                        >
                            Already have an account? Login
                        </Button>
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default RegisterPage;
