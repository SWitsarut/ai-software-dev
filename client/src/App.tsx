import { Route, Routes, useNavigate, useLocation } from "react-router-dom";
import SideBar, { SideBarItemProps } from "./components/sidebar/SideBar";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { Box } from "@mui/material";
import Debug from "./pages/Debug";
import HomeIcon from "@mui/icons-material/Home";
import PersonIcon from "@mui/icons-material/Person";
import { useAuth } from "./hooks/useAuth";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
import FileUpload from "./pages/FileUpload";
import CheckOutForm from "./pages/CheckOutForm";
import GroupsIcon from '@mui/icons-material/Groups';
import ViewTeams from "./pages/Team/ViewTeams";
import UserData from "./pages/User/UserData";
import ProfileSetting from "./pages/User/Profile-setting";
import CreateTeam from "./pages/Team/CreateTeam";
import TeamInfo from "./pages/Team/TeamInfo";
import Buy from "./pages/Project/Buy";
import MultipleFileUpload from "./pages/MultipleFileUpload";
import Hire from "./pages/Project/Hire";
import PestControlIcon from '@mui/icons-material/PestControl';
import ProjectPayment from "./pages/Project/ProjectPayment";
// Create an initial set of routes for type safety
export const baseOptions: SideBarItemProps[] = [
  { name: "Dashboard", path: "/", icon: <HomeIcon /> },
  { name: "Upload file", path: '/upload' },
  { name: "Upload files", path: '/uploads' },
  { name: "check out", path: '/checkout' },
];

// Protected routes that require authentication
export const protectedOptions: SideBarItemProps[] = [
  { name: "debug", path: "/debug", icon: <PestControlIcon /> },
  { name: "Teams", path: "/teams", icon: <GroupsIcon /> },
];

export const protectedAdminOptions: SideBarItemProps[] = [
  { name: "Own", path: "/admin/user", icon: <PersonIcon /> },
]

function App() {
  const navigate = useNavigate();
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
          <Route path="/uploads" element={<MultipleFileUpload />} />
          <Route path="/checkout" element={<CheckOutForm />} />
          <Route path="/profile/:id" element={<UserData />} />
          <Route path="/profile-setting" element={<ProfileSetting />} />

          <Route path="/teams" element={
            <ProtectedRoute>
              <ViewTeams />
            </ProtectedRoute>
          } />
          <Route path="/teams/create" element={
            <ProtectedRoute>
              <CreateTeam />
            </ProtectedRoute>
          } />
          <Route path="/teams/id/:id" element={
            <ProtectedRoute>
              <TeamInfo />
            </ProtectedRoute>
          } />
          <Route path="/teams/id/:teamId/projects/:projectId/payment" element={
            <ProtectedRoute>
              <ProjectPayment />
            </ProtectedRoute>
          } />
          <Route path="/teams/id/:id/buy" element={
            <ProtectedRoute>
              <Buy />
            </ProtectedRoute>
          } />
          <Route path="/teams/id/:id/hire" element={
            <ProtectedRoute>
              <Hire />
            </ProtectedRoute>
          } />
          <Route
            path="/debug"
            element={
              <ProtectedRoute>
                <Debug />
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
