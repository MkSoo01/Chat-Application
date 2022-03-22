import { Box, Drawer } from '@mui/material';

const drawerWidth: number = 320;

interface Props {
    children?: React.ReactNode;
    window?: () => Window;
    mobileOpen: boolean;
    handleDrawerToggle: () => void;
}

export function UserInfoPanel(props: Props) {
    const { children, window, mobileOpen, handleDrawerToggle } = props;

    const container = window !== undefined ? () => window().document.body : undefined;

    return (
        <Box component="nav" sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }} aria-label="mailbox folders">
            <Drawer
                container={container}
                variant="temporary"
                open={mobileOpen}
                onClose={handleDrawerToggle}
                ModalProps={{
                    keepMounted: true, // Better open performance on mobile.
                }}
                sx={{
                    display: { xs: 'block', sm: 'none' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
            >
                {children}
            </Drawer>
            <Drawer
                variant="permanent"
                sx={{
                    display: { xs: 'none', sm: 'block' },
                    '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                }}
                open
            >
                {children}
            </Drawer>
        </Box>
    );
}
