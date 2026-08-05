import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  UserPlus,
  Search,
  Award,
  FileText,
  UploadCloud,
  Clock,
  AlertCircle,
  FileCheck,
  Building2,
  Bell,
  LogOut,
  User,
  Key,
  Menu,
  X,
  ChevronDown,
  Sun,
  Moon,
  Calendar
} from 'lucide-react';

export const FacultyLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [studentsOpen, setStudentsOpen] = useState(true);
  const [certificatesOpen, setCertificatesOpen] = useState(true);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');

  const isActive = (path) => location.pathname === path;

  const handleSearchSubmit = (e) => {
    if (e.key === 'Enter' && globalSearch.trim()) {
      navigate(`/faculty/students/search?query=${encodeURIComponent(globalSearch.trim())}`);
      setGlobalSearch('');
    }
  };

  const currentDateFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex font-sans transition-colors duration-200">
      
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Light Blue Faculty Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-64 bg-blue-50/80 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col transition-all duration-300 shadow-lg h-screen border-r border-blue-100/90 dark:border-slate-800/80 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header Logo Card */}
        <div className="p-5 border-b border-blue-100 dark:border-slate-800 bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 text-white flex items-center justify-between shadow-xs">
          <Link to="/faculty/dashboard" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-md group-hover:scale-105 transition">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-tight block">SICMS</span>
              <span className="text-[10px] text-blue-100 font-extrabold uppercase tracking-wider block">Faculty Portal</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-semibold">
          
          <div className="space-y-1">
            <span className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-blue-900/60 dark:text-blue-400 block mb-2">
              Faculty Workspace
            </span>
            <Link
              to="/faculty/dashboard"
              className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
                isActive('/faculty/dashboard')
                  ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
              }`}
            >
              <div className={`p-1.5 rounded-lg ${isActive('/faculty/dashboard') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                <LayoutDashboard className="w-4 h-4" />
              </div>
              <span>Dashboard</span>
            </Link>
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setStudentsOpen(!studentsOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-blue-900/60 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
            >
              <span>Student Module</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${studentsOpen ? 'rotate-180' : ''}`} />
            </button>
            {studentsOpen && (
              <div className="space-y-1 pl-1">
                <Link
                  to="/admin/students"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/students')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/students') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Users className="w-4 h-4" />
                  </div>
                  <span>All Students</span>
                </Link>

                <Link
                  to="/admin/students/add"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/students/add')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/students/add') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <span>Add New Student</span>
                </Link>

                <Link
                  to="/faculty/students/search"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/faculty/students/search')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/faculty/students/search') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Search className="w-4 h-4" />
                  </div>
                  <span>Search Student</span>
                </Link>
              </div>
            )}
          </div>

          <div className="space-y-1">
            <button
              onClick={() => setCertificatesOpen(!certificatesOpen)}
              className="w-full flex items-center justify-between px-3 py-1.5 text-blue-900/60 dark:text-blue-400 hover:text-blue-900 dark:hover:text-white text-[10px] font-extrabold uppercase tracking-widest cursor-pointer"
            >
              <span>Certificate Hub</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${certificatesOpen ? 'rotate-180' : ''}`} />
            </button>
            {certificatesOpen && (
              <div className="space-y-1 pl-1">
                <Link
                  to="/admin/certificates"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/certificates')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Award className="w-4 h-4" />
                  </div>
                  <span>All Certificates</span>
                </Link>

                <Link
                  to="/admin/certificates/upload"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/certificates/upload')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/upload') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <UploadCloud className="w-4 h-4" />
                  </div>
                  <span>Upload Certificate</span>
                </Link>

                <Link
                  to="/admin/certificates/pending"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/certificates/pending')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/pending') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <Clock className="w-4 h-4" />
                  </div>
                  <span>Pending Documents</span>
                </Link>

                <Link
                  to="/admin/certificates/missing"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/certificates/missing')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/missing') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <AlertCircle className="w-4 h-4" />
                  </div>
                  <span>Missing Documents</span>
                </Link>

                <Link
                  to="/admin/certificates/types"
                  className={`flex items-center space-x-3 px-3.5 py-2 rounded-xl transition ${
                    isActive('/admin/certificates/types')
                      ? 'bg-blue-600 text-white font-extrabold shadow-md shadow-blue-500/25'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg ${isActive('/admin/certificates/types') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                    <FileText className="w-4 h-4" />
                  </div>
                  <span>Certificate Types</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-blue-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
              alt={user?.fullName || 'User'}
              className="w-9 h-9 rounded-xl object-cover border-2 border-blue-600 shadow-xs shrink-0"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user?.fullName || 'Faculty Staff'}</span>
              <span className="text-[10px] text-blue-600 font-extrabold block">FACULTY MEMBER</span>
            </div>
          </div>
          <button
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
            className="p-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Main Content Workspace */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Floating Top Navbar */}
        <header className="h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-30 shadow-xs">
          
          <div className="flex items-center space-x-4 flex-1 max-w-xl">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="relative w-full max-w-md hidden sm:block">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
              <input
                type="text"
                placeholder="Search assigned students by ID, name, roll no... (Enter)"
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                onKeyDown={handleSearchSubmit}
                className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            
            <div className="hidden xl:flex items-center space-x-1.5 px-3 py-1.5 bg-blue-50/80 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-xs font-bold">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              <span>{currentDateFormatted}</span>
            </div>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
              {isDark ? <Sun className="w-4.5 h-4.5 text-amber-400" /> : <Moon className="w-4.5 h-4.5 text-slate-600" />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 relative transition cursor-pointer"
              >
                <Bell className="w-4.5 h-4.5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-600 rounded-full ring-2 ring-white dark:ring-slate-900" />
              </button>

              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 text-xs animate-fadeIn space-y-2">
                  <span className="font-extrabold text-slate-900 dark:text-white uppercase tracking-wider block border-b pb-2">Faculty Notifications</span>
                  <p className="text-slate-500 text-[11px]">All student document reviews are up to date.</p>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2.5 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              >
                <img
                  src={user?.profilePhotoUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                  alt={user?.fullName || 'Faculty'}
                  className="w-8 h-8 rounded-xl object-cover border-2 border-blue-600 shadow-xs"
                />
                <div className="hidden md:block text-left">
                  <p className="text-xs font-bold text-slate-900 dark:text-white leading-tight">{user?.fullName || 'Faculty Staff'}</p>
                  <p className="text-[10px] text-blue-600 font-extrabold">FACULTY MEMBER</p>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
              </button>

              {profileDropdownOpen && (
                <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs animate-fadeIn">
                  <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-extrabold text-slate-900 dark:text-white">{user?.fullName}</p>
                    <p className="text-slate-400 text-[11px] truncate">{user?.email}</p>
                  </div>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile');
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 font-semibold flex items-center space-x-2.5 cursor-pointer border-b border-slate-100 dark:border-slate-800"
                  >
                    <User className="w-4 h-4 text-blue-600" />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      setProfileDropdownOpen(false);
                      navigate('/profile?tab=password');
                    }}
                    className="w-full text-left px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-950/50 hover:text-blue-600 font-semibold flex items-center space-x-2.5 cursor-pointer border-b border-slate-100 dark:border-slate-800"
                  >
                    <Key className="w-4 h-4 text-blue-600" />
                    <span>Change Password</span>
                  </button>
                  <button
                    onClick={async () => {
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 font-bold flex items-center space-x-2.5 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default FacultyLayout;