import { Route, Routes, useNavigate } from "react-router-dom";
import SideBar, { SideBarItemProps } from "./components/sidebar/SideBar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Box } from "@mui/material";
import Own from "./pages/Own";
// import Graph from "./pages/Graph";
import HomeIcon from '@mui/icons-material/Home';
import EqualizerIcon from '@mui/icons-material/Equalizer';
import PersonIcon from '@mui/icons-material/Person';
// import ProtectedRoute from "./components/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import Graph from "./components/Page";

// Create an initial set of routes for type safety
export const baseOptions: SideBarItemProps[] = [
  { name: 'Dashboard', path: '/', icon: <HomeIcon />, element: <Index /> },
  // { name: 'Statistics', path: '/graph', icon: <EqualizerIcon />, element: <Graph /> },
];

// Protected routes that require authentication
export const protectedOptions: SideBarItemProps[] = [
  { name: 'Own', path: '/own', icon: <PersonIcon />, element: <Own /> },
];

function App() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Combine public and protected routes based on authentication status
  const options = [
    ...baseOptions,
    ...(isAuthenticated ? protectedOptions : [])
  ];

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <SideBar navigate={navigate} options={options} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: 'auto',
          backgroundColor: 'background.default',
          p: 3,
          minHeight: '100vh',
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          {/* <Route path="/graph" element={<Graph />} /> */}
          {/* Protected route - Only accessible when authenticated */}
          <Route 
            path="/own" 
            element={
              <ProtectedRoute>
                <Own />
              </ProtectedRoute>
            } 
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Box>
    </Box>
  );
}

export default App;