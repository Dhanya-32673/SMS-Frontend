import React, { useEffect, useState } from 'react';
import FacultyLayout from '../../layouts/FacultyLayout';
import FacultyHeroBanner from '../../components/faculty/FacultyHeroBanner';
import FacultyStatsCards from '../../components/faculty/FacultyStatsCards';
import FacultyAssignedStudentsTable from '../../components/faculty/FacultyAssignedStudentsTable';
import dashboardService from '../../services/dashboardService';
import { useDataRefresh } from '../../utils/dataSync';
import { Loader2 } from 'lucide-react';

export const FacultyDashboard = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const data = await dashboardService.getFacultySummary();
      setSummary(data);
    } catch (err) {
      console.error('Failed to load faculty summary:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);
  useDataRefresh(['dashboard'], fetchSummary);

  const assignedCount = typeof summary?.assignedStudentsCount === 'number'
    ? summary.assignedStudentsCount
    : typeof summary?.assignedStudents === 'number'
    ? summary.assignedStudents
    : Array.isArray(summary?.assignedStudents)
    ? summary.assignedStudents.length
    : 0;

  const totalDocsCount = summary?.totalDocumentsCount ?? summary?.totalCertificates ?? 0;
  const pendingDocsCount = summary?.pendingDocumentsCount ?? summary?.pendingDocuments ?? 0;

  const studentList = Array.isArray(summary?.assignedStudents)
    ? summary.assignedStudents
    : Array.isArray(summary?.recentStudents)
    ? summary.recentStudents
    : [];

  return (
    <FacultyLayout>
      <div className="space-y-8 font-sans">
        {/* Banner Welcome Card */}
        <FacultyHeroBanner />

        {/* Loading Spinner State */}
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 mb-3" />
            <p className="text-xs font-semibold">Loading assigned students and certificate statistics...</p>
          </div>
        ) : (
          <>
            {/* KPI Stat Cards Grid */}
            <FacultyStatsCards
              assignedCount={assignedCount}
              totalDocsCount={totalDocsCount}
              pendingDocsCount={pendingDocsCount}
            />

            {/* Assigned Students Table */}
            <FacultyAssignedStudentsTable studentList={studentList} />
          </>
        )}
      </div>
    </FacultyLayout>
  );
};

export default FacultyDashboard;
