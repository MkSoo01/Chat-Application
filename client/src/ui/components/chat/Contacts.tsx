import { Avatar, Box, List, ListItemButton, ListItemText, Typography } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import React, { useState } from 'react';
import AddContact from './AddContact';

interface Props {
    contacts: string[];
    addContactCallback: (newContact: string) => any;
    selectContactCallback: (selectedContact: string) => void;
}

export default function Contacts(props: Props) {
    const { contacts, selectContactCallback, addContactCallback } = props;
    const [selectedIndex, setSelectedIndex] = useState(0);

    const handleListItemClick = (event: any, index: any) => {
        setSelectedIndex(index);
        selectContactCallback(contacts[index]);
    };

    return (
        <Box sx={{ py: 2 }}>
            <Typography variant="subtitle1">Contact list</Typography>
            <AddContact addContactCallback={addContactCallback} />
            <List>
                {contacts
                    ? contacts.map((text, index) => (
                          <ListItemButton
                              key={index}
                              selected={selectedIndex === index}
                              onClick={(event) => handleListItemClick(event, index)}
                          >
                              <Avatar sx={{ mr: 4 }}>
                                  <PersonIcon />
                              </Avatar>
                              <ListItemText primary={text} />
                          </ListItemButton>
                      ))
                    : ''}
            </List>
        </Box>
    );
}
