import { type FC } from "react";
import { Drawer, List, ListItemButton, ListItemText, Toolbar, useTheme, useMediaQuery } from "@mui/material";
import { useNavigate, useLocation } from "react-router-dom";

interface SidebarProps {
	open: boolean;
	onClose?: () => void;
}

const drawerWidth = 240;

const menuItems = [
	{ label: "Dashboard", path: "/dashboard" },
	{ label: "Expenses", path: "/expenses" },
];

const Sidebar: FC<SidebarProps> = ({ open, onClose }) => {
	const navigate = useNavigate();
	const location = useLocation();
	const theme = useTheme();
	const isMobile = useMediaQuery(theme.breakpoints.down("md"));


	return (
		<Drawer
			variant={isMobile ? "temporary" : "persistent"}
			open={open}
			onClose={onClose}
			ModalProps={{ keepMounted: true }}
			sx={{
				width: open ? drawerWidth : 0,
				flexShrink: 0,
				"& .MuiDrawer-paper": {
					width: open ? drawerWidth : 0,
					transition: "width 0.6s ease", 
					overflowX: "hidden",
				},
			}}
		>
			<Toolbar />
			<List>
				{menuItems.map((item) => (
					<ListItemButton
						key={item.path}
						selected={location.pathname === item.path}
						onClick={() => {
							navigate(item.path);
							if (isMobile && onClose) onClose();
						}}
					>
						<ListItemText primary={item.label} sx={{ opacity: open ? 1 : 0 }} />
					</ListItemButton>
				))}
			</List>
		</Drawer>
	);
};

export default Sidebar;
