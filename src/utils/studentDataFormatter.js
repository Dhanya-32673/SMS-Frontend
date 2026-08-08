export const formatSectionName = (sec) => {
  if (!sec || sec === 'Unassigned' || sec === 'Section Unassigned' || sec === 'N/A' || sec === '—') {
    return 'Unassigned';
  }
  const clean = String(sec).replace(/^Section\s+/i, '').trim();
  if (!clean || clean.toLowerCase() === 'unassigned') return 'Unassigned';
  return `Section ${clean}`;
};

export const formatBranchGroup = (group) => {
  if (!group || group === 'N/A' || group === '—') return 'General';
  return String(group).trim();
};

export const formatIntermediateYear = (year) => {
  if (!year || year === 'N/A' || year === '—') return '1st Year';
  return String(year).trim();
};
