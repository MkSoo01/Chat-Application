import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Field, Form, FormSpy } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import { Typography } from '../components';
import { AppForm, RFTextField, FormButton, FormFeedback, email, required } from '../form';
import userService from '../../services/userService';

function SignUp() {
    let navigate = useNavigate();
    const validate = (values: { [index: string]: string }) => {
        const errors = required(['username', 'email', 'password'], values);

        if (!errors.email) {
            const emailError = email(values.email);
            if (emailError) {
                errors.email = emailError;
            }
        }

        return errors;
    };

    const handleSubmit = async (values: any) => {
        let errorMessage = 'Submit Error';
        return userService
            .registerUser(values.username, values.password, values.email)
            .then((user) => {
                navigate('/', { state: user });
            })
            .catch((err) => {
                if (err instanceof Error) {
                    errorMessage = err.message;
                    return { [FORM_ERROR]: errorMessage };
                }
            });
    };

    return (
        <React.Fragment>
            <AppForm>
                <React.Fragment>
                    <Typography variant="h3" gutterBottom marked="center" align="center">
                        Sign Up
                    </Typography>
                    <Typography variant="body2" align="center">
                        <Link href="/Login" underline="always">
                            Already have an account?
                        </Link>
                    </Typography>
                </React.Fragment>
                <Form onSubmit={handleSubmit} subscription={{ submitting: true }} validate={validate}>
                    {({ handleSubmit: handleSubmit2, submitting }) => (
                        <Box component="form" onSubmit={handleSubmit2} noValidate sx={{ mt: 6 }}>
                            <Field
                                autoFocus
                                component={RFTextField}
                                disabled={submitting}
                                autoComplete="given-name"
                                fullWidth
                                label="Username"
                                margin="normal"
                                name="username"
                                required
                            />
                            <Field
                                autoComplete="email"
                                component={RFTextField}
                                disabled={submitting}
                                fullWidth
                                label="Email"
                                margin="normal"
                                name="email"
                                required
                            />
                            <Field
                                fullWidth
                                component={RFTextField}
                                disabled={submitting}
                                required
                                name="password"
                                autoComplete="new-password"
                                label="Password"
                                type="password"
                                margin="normal"
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
                            <FormButton sx={{ mt: 3, mb: 2 }} disabled={submitting} color="secondary" fullWidth>
                                {submitting ? 'In progress…' : 'Sign Up'}
                            </FormButton>
                        </Box>
                    )}
                </Form>
            </AppForm>
        </React.Fragment>
    );
}

export default SignUp;
