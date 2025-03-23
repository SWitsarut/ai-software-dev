import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import SideBar, { SideBarItemProps } from "./components/sidebar/SideBar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Box } from "@mui/material";
import Own from "./pages/Own";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import FileUpload from "./pages/FileUpload";

// Create an initial set of routes for type safety
export const baseOptions: SideBarItemProps[] = [
  { name: "Dashboard", path: "/", icon: <HomeIcon />},
  { name: "Upload file", path: 'upload'},
];

// Protected routes that require authentication
export const protectedOptions: SideBarItemProps[] = [
  { name: "Own", path: "/own", icon: <PersonIcon />},
];

export const protectedAdminOptions: SideBarItemProps[] = [
  { name: "Own", path: "/admin/user", icon: <PersonIcon />},
]

function App() {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Combine public and protected routes based on authentication status
  const options = [
    ...baseOptions,
    ...(isAuthenticated ? protectedOptions : []),
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh" }}>
      {/* Render Sidebar only if not on Index page */}
      {<SideBar navigate={navigate} options={options} />}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          overflow: "auto",
          backgroundColor: "background.default",
          p: 3,
          minHeight: "100vh",
        }}
      >
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/upload" element={<FileUpload />} />
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
