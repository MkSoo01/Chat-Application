import { Avatar, Box, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import Paper from '../Paper';

interface Props {
    username: string;
    email: string;
}

export default function Account(props: Props) {
    const { username, email } = props;

    return (
        <>
            <Paper background="light">
                <Box
                    sx={{
                        alignItems: 'center',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'flex-start',
                        px: 4,
                        py: '20px',
                    }}
                >
                    <Avatar sx={{ mr: 4 }}>
                        <PersonIcon />
                    </Avatar>
                    <div>
                        <Typography color="inherit" variant="subtitle1">
                            {username}
                        </Typography>
                        <Typography color="neutral.400" variant="body2">
                            {email}
                        </Typography>
                    </div>
                </Box>
            </Paper>
        </>
    );
}
