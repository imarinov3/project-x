import { ChakraProvider } from '@chakra-ui/react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';
import Layout from './components/Layout';
import Home from './pages/Home';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import CreateEvent from './pages/CreateEvent';
import EventDetails from './pages/EventDetails';

// Protected route component
const RequireAuth = ({ children }: { children: React.ReactNode }) => {
  const { authStatus } = useAuthenticator((context) => [context.authStatus]);
  
  if (authStatus !== 'authenticated') {
    return <Navigate to="/signin" replace />;
  }
  
  return <>{children}</>;
};

function App() {
  return (
    <ChakraProvider>
      <Router>
        <Authenticator.Provider>
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signin" element={<SignIn />} />
              <Route path="/signup" element={<SignUp />} />
              <Route path="/profile" element={<RequireAuth><Profile /></RequireAuth>} />
              <Route path="/create-event" element={<RequireAuth><CreateEvent /></RequireAuth>} />
              <Route path="/event/:id" element={<EventDetails />} />
            </Routes>
          </Layout>
        </Authenticator.Provider>
      </Router>
    </ChakraProvider>
  );
}

export default App;
