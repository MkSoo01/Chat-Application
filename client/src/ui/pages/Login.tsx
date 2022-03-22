import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Field, Form, FormSpy } from 'react-final-form';
import { FORM_ERROR } from 'final-form';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { Typography } from '../components';
import { AppForm, RFTextField, FormButton, FormFeedback, email, required } from '../form';
import userService from '../../services/userService';

function Login() {
    let navigate = useNavigate();

    const validate = (values: { [index: string]: string }) => {
        const errors = required(['username', 'password'], values);
        return errors;
    };

    const handleSubmit = (values: any) => {
        let errorMessage = 'Submit Error';
        return userService
            .login(values.username, values.password)
            .then((user) => navigate('/', { state: user }))
            .catch((err) => {
                if (err && err instanceof Error) {
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
                        Sign In
                    </Typography>
                    <Typography variant="body2" align="center">
                        {'Not a member yet? '}
                        <Link href="/SignUp" align="center" underline="always">
                            Sign Up here
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
                                size="large"
                            />
                            <Field
                                fullWidth
                                size="large"
                                component={RFTextField}
                                disabled={submitting}
                                required
                                name="password"
                                autoComplete="current-password"
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
                            <FormButton
                                sx={{ mt: 3, mb: 2 }}
                                disabled={submitting}
                                size="large"
                                color="secondary"
                                fullWidth
                            >
                                {submitting ? 'In progress…' : 'Sign In'}
                            </FormButton>
                        </Box>
                    )}
                </Form>
                {/* <Typography align="center">
                    <Router>
                        <Link underline="always" href="/premium-themes/onepirate/forgot-password/">
                            Forgot password?
                        </Link>
                    </Router>
                </Typography> */}
            </AppForm>
        </React.Fragment>
    );
}

export default Login;
