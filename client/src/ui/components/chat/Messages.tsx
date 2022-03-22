import { Box, Grid, List, ListItem, ListItemText, Paper } from '@mui/material';
import { IMessage } from '../../../models/message';
import { format } from 'date-fns';

interface Props {
    username: string;
    messagesEndRef: React.LegacyRef<HTMLDivElement> | undefined;
    messages: IMessage[];
}

function getFormattedDateTime(datetime: any): string {
    return datetime ? format(new Date(datetime), 'dd-MM-yyyy HH:mm') : '';
}

export default function Messages(props: Props) {
    const { messages, username, messagesEndRef } = props;

    return (
        <Box sx={{ height: '80vh', overflowY: 'auto', pt: 2 }}>
            <List>
                {messages
                    ? messages.map((message, index) => (
                          <ListItem key={index}>
                              <Grid
                                  container
                                  direction="column"
                                  alignItems={message.from === username ? 'flex-end' : 'flex-start'}
                              >
                                  <Paper
                                      sx={[{ p: 1 }, message.from === username ? { bgcolor: 'secondary.light' } : {}]}
                                  >
                                      <Grid item>
                                          <ListItemText
                                              secondary={getFormattedDateTime(message.createdTime)}
                                          ></ListItemText>
                                      </Grid>
                                      <Grid item>
                                          <ListItemText primary={message.messageText}></ListItemText>
                                      </Grid>
                                  </Paper>
                              </Grid>
                          </ListItem>
                      ))
                    : ''}
                <div ref={messagesEndRef} />
            </List>
        </Box>
    );
}
