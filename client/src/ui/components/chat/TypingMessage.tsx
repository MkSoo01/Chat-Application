import { Box, Fab, Grid, TextField } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import { useState } from 'react';

interface Props {
    sendMessageCallback: (message: string) => void;
}

export default function TypingMessage(props: Props) {
    const { sendMessageCallback } = props;
    const [message, setMessage] = useState('');

    const onEnterKeyPressHandler = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            sendMessageCallback(message);
            setMessage('');
        }
    };

    return (
        <Box sx={{ height: '10vh' }}>
            <Grid container style={{ padding: '20px' }} spacing="5">
                <Grid item xs={10} md={11}>
                    <TextField
                        id="outlined-basic-email"
                        label="Type Something"
                        fullWidth
                        value={message}
                        onChange={(event) => setMessage(event.target.value)}
                        onKeyPress={onEnterKeyPressHandler}
                    />
                </Grid>
                <Grid item xs={1}>
                    <Fab
                        color="primary"
                        aria-label="add"
                        onClick={() => {
                            sendMessageCallback(message);
                            setMessage('');
                        }}
                    >
                        <SendIcon />
                    </Fab>
                </Grid>
            </Grid>
        </Box>
    );
}
