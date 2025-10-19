import { Box, CircularProgress, Toolbar } from "@mui/material";
import Topbar from "./Topbar";
import Sidebar from "./Sidebar";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Outlet } from "react-router-dom";

const Layout: React.FC = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (loading) {
    return (
      <Box display="flex" alignItems="center" justifyContent="center" height="100vh" width="100%">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex" }}>
      <Topbar username={user?.username || "?"} onMenuClick={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          transition: "margin 0.3s ease",
        }}
      >
        <Toolbar />
        <Outlet />
      </Box>
    </Box>
  );
};
export default Layout;
