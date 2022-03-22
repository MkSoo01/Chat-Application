import { Box, Grid } from '@mui/material';

interface Props {
    children?: React.ReactNode;
}

export default function ChattingArea(props: Props) {
    const { children } = props;
    return (
        <Box
            component="main"
            sx={{
                backgroundColor: (theme) =>
                    theme.palette.mode === 'light' ? theme.palette.grey[100] : theme.palette.grey[900],
                flexGrow: 1,
                height: '100vh',
                overflow: 'hidden',
            }}
        >
            <Grid container sx={{ mt: 8, mb: 4 }}>
                <Grid item xs={12}>
                    {children}
                </Grid>
            </Grid>
        </Box>
    );
}
