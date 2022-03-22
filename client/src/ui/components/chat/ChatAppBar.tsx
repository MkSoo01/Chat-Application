import * as React from 'react';
import { AppBar, Button, IconButton, Stack, Toolbar, Typography } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import LogoutIcon from '@mui/icons-material/Logout';

const drawerWidth: number = 320;

interface Props {
    title: string;
    handleDrawerToggle?: () => void;
    logoutHandler: () => void;
}

export function ChatAppBar(props: Props) {
    const { handleDrawerToggle, title, logoutHandler } = props;

    return (
        <AppBar
            position="fixed"
            sx={{
                width: { sm: `calc(100% - ${drawerWidth}px)` },
                ml: { sm: `${drawerWidth}px` },
            }}
        >
            <Toolbar>
                <IconButton
                    color="inherit"
                    aria-label="open drawer"
                    edge="start"
                    onClick={handleDrawerToggle}
                    sx={{ mr: 2, display: { sm: 'none' } }}
                >
                    <MenuIcon />
                </IconButton>
                <Typography component="h1" variant="h6" color="inherit" noWrap sx={{ flexGrow: 1 }}>
                    {title}
                </Typography>
                <Stack direction="column" alignItems="flex-end">
                    <Button color="inherit" endIcon={<LogoutIcon />} onClick={logoutHandler}>
                        Logout
                    </Button>
                </Stack>
            </Toolbar>
        </AppBar>
    );
}
