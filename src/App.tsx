import { Navigate, Route, Routes, Link, useNavigate } from "react-router-dom";
import Login from "./pages/Login.tsx";
import Register from "./pages/Register.tsx";
import PropertiesList from "./pages/PropertiesList.tsx";
import PropertyForm from "./pages/PropertyForm.tsx";
import PropertyDetail from "./pages/PropertyDetail.tsx";

function AuthGuard({ children }: { children: React.ReactElement }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/login" replace />;
  return children;
}

function Layout({ children }: { children: React.ReactNode }) {
  const nav = useNavigate();
  const token = localStorage.getItem("token");
  const logout = () => {
    localStorage.removeItem("token");
    nav("/login", { replace: true });
  };
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="font-semibold">Real Estate Admin</Link>
          <nav className="flex items-center gap-3">
            {token ? (
              <>
                <Link to="/properties" className="text-sm">Danh sách</Link>
                <Link to="/properties/new" className="text-sm">Tạo mới</Link>
                <button onClick={logout} className="text-sm px-3 py-1 rounded bg-gray-200">Logout</button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-sm">Login</Link>
                <Link to="/register" className="text-sm">Register</Link>
              </>
            )}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
    </div>
  );
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Layout><Login/></Layout>} />
      <Route path="/register" element={<Layout><Register/></Layout>} />
      <Route
        path="/properties"
        element={<Layout><AuthGuard><PropertiesList/></AuthGuard></Layout>}
      />
      <Route
        path="/properties/new"
        element={<Layout><AuthGuard><PropertyForm/></AuthGuard></Layout>}
      />
      <Route
        path="/properties/:id"
        element={<Layout><AuthGuard><PropertyDetail/></AuthGuard></Layout>}
      />
      <Route
        path="/properties/:id/edit"
        element={<Layout><AuthGuard><PropertyForm/></AuthGuard></Layout>}
      />
      <Route path="/" element={<Navigate to="/properties" replace />} />
    </Routes>
  );
}
