import { Box, Button, Dialog, DialogContent, DialogContentText, DialogTitle, Stack } from '@mui/material';
import { Field, Form, FormSpy } from 'react-final-form';
import { RFTextField, FormButton, FormFeedback, required } from '../../form';
import React from 'react';

interface Props {
    addContactCallback: (newContact: string) => any;
}

export default function AddContact(props: Props) {
    const { addContactCallback } = props;
    const [open, setOpen] = React.useState(false);

    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const validate = (values: { [index: string]: string }) => {
        const errors = required(['username'], values);
        return errors;
    };

    const handleSubmit = async (values: any) => {
        const err = await addContactCallback(values.username);
        if (err) {
            return err;
        }

        handleClose();
    };

    return (
        <>
            <Button variant="outlined" sx={{ px: 10, my: 2 }} onClick={handleClickOpen}>
                Add Contact
            </Button>

            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Add Contact</DialogTitle>
                <DialogContent>
                    <DialogContentText>To add a new contact, please enter the contact username here.</DialogContentText>
                    <Form onSubmit={handleSubmit} subscription={{ submitting: true }} validate={validate}>
                        {({ handleSubmit: handleSubmit2, submitting }) => (
                            <Box component="form" onSubmit={handleSubmit2} noValidate>
                                <Field
                                    autoFocus
                                    component={RFTextField}
                                    disabled={submitting}
                                    fullWidth
                                    label="Contact Username"
                                    margin="normal"
                                    name="username"
                                    required
                                    size="medium"
                                />
                                <FormSpy subscription={{ submitError: true }}>
                                    {({ submitError }) =>
                                        submitError ? (
                                            <FormFeedback error sx={{ mt: 2 }}>
                                                {submitError}
                                            </FormFeedback>
                                        ) : null
                                    }
                                </FormSpy>
                                <Stack direction="row" alignItems="center" justifyContent="end">
                                    <Button sx={{ p: 2 }} onClick={handleClose}>
                                        Cancel
                                    </Button>
                                    <FormButton color="secondary" disabled={submitting}>
                                        {submitting ? 'In progress…' : 'Add'}
                                    </FormButton>
                                </Stack>
                            </Box>
                        )}
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}
