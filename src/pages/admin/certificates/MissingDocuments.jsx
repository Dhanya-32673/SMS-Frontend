import React, { useEffect, useState } from 'react';
import AdminLayout from '../../../layouts/AdminLayout';
import FacultyLayout from '../../../layouts/FacultyLayout';
import { useAuth } from '../../../context/AuthContext';
import certificateService from '../../../services/certificateService';
import { useDataRefresh } from '../../../utils/dataSync';
import { formatSectionName, formatBranchGroup } from '../../../utils/studentDataFormatter';
import facultyService from '../../../services/facultyService';
import { AlertCircle, Plus, Search, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MissingDocuments = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const rawRole = (typeof user?.role === 'string' ? user.role : user?.role?.roleName || user?.role?.name || '').replace('ROLE_', '').toUpperCase();
  const isAdmin = rawRole === 'ADMIN';
  const Layout = isAdmin ? AdminLayout : FacultyLayout;

  const [missingRecords, setMissingRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter State
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [yearFilter, setYearFilter] = useState('');
  const [sectionFilter, setSectionFilter] = useState('');

  // Faculty assignments for dropdown filtering
  const [facultyAssignments, setFacultyAssignments] = useState([]);

  useEffect(() => {
    if (!isAdmin) {
      facultyService.getCurrentFacultyAssignments()
        .then((data) => setFacultyAssignments((data || []).filter(a => a.active)))
        .catch((err) => console.error('Failed to load faculty assignments:', err));
    }
  }, [isAdmin]);

  const allGroups = ['MPC', 'BiPC', 'MEC', 'CEC', 'HEC'];
  const allYears = ['1st Year', '2nd Year'];
  const allSections = ['A', 'B', 'C', 'D'];

  const availableGroups = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.branchGroup)))
    : allGroups;

  const availableYears = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.intermediateYear)))
    : allYears;

  const availableSections = !isAdmin && facultyAssignments.length > 0
    ? Array.from(new Set(facultyAssignments.map(a => a.section)))
    : allSections;

  const fetchMissing = async () => {
    setLoading(true);
    try {
      const data = await certificateService.getStudentSummaries({
        status: 'NEEDS ATTENTION',
        size: 100,
        search: search || undefined,
        group: groupFilter || undefined,
        year: yearFilter || undefined,
        section: sectionFilter || undefined,
      });
      setMissingRecords(data.content || []);
    } catch (err) {
      console.error('Failed to load missing documents:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMissing();
  }, [search, groupFilter, yearFilter, sectionFilter]);
  useDataRefresh(['certificates', 'students'], fetchMissing);

  return (
    <Layout>
      <div className="space-y-5 sm:space-y-6 font-sans">
        
        {/* Banner Welcome Card */}
        <div className="bg-gradient-to-r from-blue-600 via-blue-600 to-blue-500 rounded-3xl p-5 sm:p-8 text-white shadow-xl shadow-blue-500/25 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-2 text-left">
            <span className="px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-[10px] sm:text-[11px] font-extrabold uppercase tracking-widest text-blue-100 border border-white/20 inline-block">
              Certificate Audit Alert
            </span>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight">
              Missing Student Certificates
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 font-medium max-w-xl">
              {!isAdmin ? 'Enrolled students in your assigned sections with un-submitted mandatory certificates.' : 'Students with un-submitted mandatory academic certificates and pending document uploads.'}
            </p>
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/20 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-lg shrink-0">
            <AlertCircle className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                placeholder="Search by Student ID, Name, Roll No..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 min-h-[44px]"
              />
            </div>

            <div className="grid grid-cols-2 sm:flex sm:items-center gap-2 w-full md:w-auto">
              <select
                value={groupFilter}
                onChange={(e) => setGroupFilter(e.target.value)}
                className="px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Groups</option>
                {availableGroups.map(grp => (
                  <option key={grp} value={grp}>{grp}</option>
                ))}
              </select>

              <select
                value={yearFilter}
                onChange={(e) => setYearFilter(e.target.value)}
                className="px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Years</option>
                {availableYears.map(yr => (
                  <option key={yr} value={yr}>{yr}</option>
                ))}
              </select>

              <select
                value={sectionFilter}
                onChange={(e) => setSectionFilter(e.target.value)}
                className="px-3 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl font-bold text-slate-700 dark:text-slate-300 focus:outline-none min-h-[44px]"
              >
                <option value="">All Sections</option>
                {availableSections.map(sec => (
                  <option key={sec} value={sec}>Section {sec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Missing Certificates Container */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-2" />
              <p className="text-xs font-bold">Checking missing document compliance...</p>
            </div>
          ) : missingRecords.length === 0 ? (
            <div className="p-12 text-center space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">100% Certificate Compliance</h3>
              <p className="text-xs text-slate-500">All enrolled students have submitted their mandatory certificates.</p>
            </div>
          ) : (
            <>
              {/* MOBILE STACKED CARDS (< md) */}
              <div className="block md:hidden divide-y divide-slate-100 dark:divide-slate-800">
                {missingRecords.map((st) => (
                  <div key={st.id || st.studentId} className="p-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white">{st.fullName}</h4>
                        <p className="text-xs font-mono font-bold text-blue-600">{st.studentId}</p>
                        <p className="text-[10px] text-slate-400">
                          {formatBranchGroup(st.branchGroup)} • Section {formatSectionName(st.section)}
                        </p>
                      </div>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-rose-50 text-rose-700 border border-rose-200 shrink-0">
                        {st.missingCount} Missing
                      </span>
                    </div>

                    <div className="space-y-1 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl">
                      <div className="flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-600 dark:text-slate-400">Progress</span>
                        <span className="text-blue-600 font-mono">{st.completionPercentage}%</span>
                      </div>
                      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-blue-600 rounded-full"
                          style={{ width: `${st.completionPercentage}%` }}
                        />
                      </div>
                    </div>

                    <button
                      onClick={() => navigate(`/admin/certificates/upload?studentId=${st.studentId}`)}
                      className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center space-x-2 min-h-[44px] cursor-pointer shadow-xs"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Upload Missing Documents</span>
                    </button>
                  </div>
                ))}
              </div>

              {/* DESKTOP TABLE (md+) */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200/80 dark:border-slate-800 text-slate-500 dark:text-slate-400 font-extrabold uppercase text-[11px] tracking-wider whitespace-nowrap">
                    <tr>
                      <th className="px-4 py-3.5">Student ID</th>
                      <th className="px-4 py-3.5">Student Name</th>
                      <th className="px-4 py-3.5">Group & Year</th>
                      <th className="px-4 py-3.5">Section</th>
                      <th className="px-4 py-3.5">Missing Count</th>
                      <th className="px-4 py-3.5">Progress</th>
                      <th className="px-4 py-3.5 text-right pr-6">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                    {missingRecords.map((st) => (
                      <tr key={st.id || st.studentId} className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition">
                        <td className="px-4 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">{st.studentId}</td>
                        <td className="px-4 py-3.5 font-bold text-slate-900 dark:text-white">{st.fullName}</td>
                        <td className="px-4 py-3.5">
                          <span className="px-2.5 py-0.5 bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 rounded-md text-[10px] font-extrabold">
                            {formatBranchGroup(st.branchGroup)}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-800 dark:text-slate-200">{formatSectionName(st.section)}</td>
                        <td className="px-4 py-3.5 font-bold text-rose-600">{st.missingCount} Missing</td>
                        <td className="px-4 py-3.5">
                          <div className="w-28 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-600 rounded-full"
                              style={{ width: `${st.completionPercentage}%` }}
                            />
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-right pr-6 whitespace-nowrap">
                          <button
                            onClick={() => navigate(`/admin/certificates/upload?studentId=${st.studentId}`)}
                            className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl inline-flex items-center shadow-xs cursor-pointer min-h-[36px]"
                          >
                            <Plus className="w-3.5 h-3.5 mr-1" /> Upload Missing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default MissingDocuments;
