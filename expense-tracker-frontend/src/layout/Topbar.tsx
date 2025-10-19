import { type FC, useState } from "react";
import {
    AppBar,
    Toolbar,
    Typography,
    Avatar,
    Box,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions,
    IconButton,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate } from "react-router-dom";
import axiosClient from "../api/axiosClient";

interface TopbarProps {
    username: string;
    onMenuClick: () => void; 
}

const Topbar: FC<TopbarProps> = ({ username, onMenuClick }) => {
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();

    const initial = username ? username.charAt(0).toUpperCase() : "?";

    const handleLogoutClick = () => setOpen(true);

    const handleConfirmLogout = async () => {
        try {
            await axiosClient.post("/api/expense-tracker/auth/logout", null, {
                withCredentials: true,
            });
            navigate("/login", { replace: true });
        } catch (error) {
            console.error("Error during logout:", error);
        } finally {
            setOpen(false);
        }
    };

    return (
        <>
            <AppBar
                position="fixed"
                sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
            >
                <Toolbar sx={{ display: "flex", justifyContent: "space-between" }}>
                    {/* 👇 Left side — hamburger icon + title */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <IconButton
                            color="inherit"
                            edge="start"
                            onClick={onMenuClick}
                            sx={{ mr: 1 }}
                        >
                            <MenuIcon />
                        </IconButton>

                        <Typography variant="h6" noWrap>
                            Expense Tracker
                        </Typography>
                    </Box>

                    {/* 👇 Right side — user avatar + logout */}
                    <Box display="flex" alignItems="center" gap={2}>
                        <Avatar>{initial}</Avatar>
                        <Button
                            variant="outlined"
                            color="inherit"
                            onClick={handleLogoutClick}
                        >
                            Logout
                        </Button>
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Logout Confirmation Dialog */}
            <Dialog open={open} onClose={() => setOpen(false)}>
                <DialogTitle>Confirm Logout</DialogTitle>
                <DialogContent>
                    <DialogContentText>
                        Do you really want to logout?
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpen(false)} color="inherit">
                        Cancel
                    </Button>
                    <Button
                        onClick={handleConfirmLogout}
                        color="error"
                        variant="contained"
                    >
                        Logout
                    </Button>
                </DialogActions>
            </Dialog>
        </>
    );
};

export default Topbar;
