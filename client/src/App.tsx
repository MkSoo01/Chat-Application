import './App.css';
import { Routes, Route } from 'react-router-dom';
import { SignUp, Login, Chat } from './ui/pages';
import RequireAuth from './ui/auth/RequireAuth';

function App() {
    return (
        <div className="App">
            <Routes>
                <Route
                    path="/"
                    element={
                        <RequireAuth>
                            <Chat />
                        </RequireAuth>
                    }
                />
                <Route path="/Login" element={<Login />} />
                <Route path="/SignUp" element={<SignUp />} />
                <Route
                    path="*"
                    element={
                        <main>
                            {' '}
                            <p>There's nothing here!</p>{' '}
                        </main>
                    }
                />
            </Routes>
        </div>
    );
}

export default App;
