import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
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
  LogOut,
  X,
  ChevronDown
} from 'lucide-react';

export const FacultySidebar = ({ mobileOpen, setMobileOpen }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [studentsOpen, setStudentsOpen] = useState(true);
  const [certificatesOpen, setCertificatesOpen] = useState(true);

  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-950/60 z-40 lg:hidden backdrop-blur-sm animate-fadeIn"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Light Blue Enterprise Faculty Sidebar */}
      <aside
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 w-64 bg-blue-50/80 dark:bg-slate-950 text-slate-700 dark:text-slate-300 flex flex-col transition-all duration-300 shadow-lg h-screen border-r border-blue-100/90 dark:border-slate-800/80 shrink-0 ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Sidebar Header Logo Card (Matches Admin Branding Exactly) */}
        <div className="p-4 border-b border-blue-600 bg-blue-600 text-white flex items-center justify-between shadow-md">
          <Link to="/faculty/dashboard" className="flex items-center space-x-3 group">
            <div className="relative flex items-center justify-center shrink-0">
              <img
                src="https://ookzjdmkoaunbrufvmvq.supabase.co/storage/v1/object/public/student-profile-photos/info/ChatGPT%20Image%20Aug%206,%202026,%2012_07_23%20AM.png"
                alt="Bhashyam Educational Institutions"
                className="w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-[6px] object-contain shrink-0 group-hover:scale-105 transition"
                loading="eager"
                onError={(e) => {
                  e.target.classList.add('hidden');
                  if (e.target.nextSibling) e.target.nextSibling.classList.remove('hidden');
                }}
              />
              <div className="hidden w-7 h-7 sm:w-8 sm:h-8 lg:w-9 lg:h-9 rounded-[6px] bg-white/20 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
            </div>
            <div>
              <span className="font-black text-white text-lg tracking-wider block leading-tight">BHASHYAM</span>
              <span className="text-[9px] text-blue-100 font-extrabold uppercase tracking-widest block mt-0.5">EDUCATIONAL INSTITUTION</span>
            </div>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden text-white/80 hover:text-white p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sidebar Navigation Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 text-xs font-semibold">
          
          {/* Main Group */}
          <div className="space-y-1">
            <span className="px-3 text-xs font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 block mb-2">
              CORE OPERATIONS
            </span>
            <Link
              to="/faculty/dashboard"
              className={`flex items-center space-x-3.5 px-3.5 py-3 rounded-2xl transition-all ${
                isActive('/faculty/dashboard')
                  ? 'bg-blue-600 text-white font-bold shadow-lg shadow-blue-600/30'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-blue-100/70 dark:hover:bg-slate-800/60 hover:text-blue-700 dark:hover:text-white'
              }`}
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${isActive('/faculty/dashboard') ? 'bg-white/20 text-white' : 'bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'}`}>
                <LayoutDashboard className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold">Dashboard</span>
            </Link>
          </div>

          {/* Student Management Accordion Group */}
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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

          {/* Certificate Management Accordion Group */}
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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
                  className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition ${
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

        {/* Sidebar Footer User Info */}
        <div className="p-4 border-t border-blue-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <img
              src={user?.profilePhotoUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Faculty')}&background=2563eb&color=fff`}
              alt={user?.fullName || 'User'}
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || 'Faculty')}&background=2563eb&color=fff`;
              }}
              className="w-9 h-9 rounded-xl object-cover border-2 border-blue-600 shadow-xs shrink-0"
            />
            <div className="truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-white block truncate">{user?.fullName || 'Faculty Member'}</span>
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
    </>
  );
};

export default FacultySidebar;
