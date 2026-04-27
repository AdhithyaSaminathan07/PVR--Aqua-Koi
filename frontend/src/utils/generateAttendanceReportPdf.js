// import html2pdf from 'html2pdf.js'; // Install this package to enable PDF export: npm install html2pdf.js

export const generateAttendanceReportPdf = (attendanceData, filters = {}) => {
  // Format the date
  const currentDate = new Date().toLocaleDateString();

  // Prepare data for the report
  const exportData = [];

  attendanceData.forEach(entry => {
    // Handle both grouped and flattened structures
    const records = entry.displayRecords || entry.records || [];
    const entryDate = entry.displayDate || entry.date;

    if (!entryDate && (!records || records.length === 0)) return;

    // Sort records by time to ensure proper order
    const sortedRecords = [...records].sort((a, b) => {
      const timeA = new Date(a.checkIn);
      const timeB = new Date(b.checkIn);
      return timeA - timeB;
    });

    // Get all punch in times
    const punchInTimes = sortedRecords
      .filter(record => record.checkIn)
      .map(record => {
        return {
          time: formatTime(record.checkIn),
          isMissedPunchOut: record.isManualCorrection && !record.checkOut
        };
      });

    // Get all punch out times
    const punchOutTimes = sortedRecords
      .filter(record => record.checkOut)
      .map(record => {
        return {
          time: formatTime(record.checkOut)
        };
      });

    // Calculate total working time
    let totalMilliseconds = 0;
    sortedRecords.forEach(record => {
      if (record.checkIn && record.checkOut) {
        const start = new Date(record.checkIn);
        const end = new Date(record.checkOut);
        totalMilliseconds += (end - start);
      }
    });

    const totalSeconds = Math.floor(totalMilliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600).toString().padStart(2, '0');
    const minutes = Math.floor((totalSeconds % 3600) / 60).toString().padStart(2, '0');
    const seconds = (totalSeconds % 60).toString().padStart(2, '0');
    const totalDuration = `${hours}.${minutes}.${seconds}`;

    const maxPairs = Math.max(punchInTimes.length, punchOutTimes.length, 1);

    for (let i = 0; i < maxPairs; i++) {
      exportData.push({
        'Employee Name': entry.name || entry.worker?.name || 'Unknown',
        'RF ID': entry.rfid || entry.worker?.rfid || 'N/A',
        'Date': formatDate(entryDate),
        'Punch In': punchInTimes[i] ? punchInTimes[i].time : (i === 0 && punchInTimes.length === 0 ? 'No Record' : '--:--'),
        'Punch Out': punchOutTimes[i] ? punchOutTimes[i].time : (i === 0 && punchOutTimes.length === 0 ? '--:--:--' : '--:--'),
        'Total Duration': totalDuration
      });
    }
  });

  const totalEmployees = [...new Set(exportData.map(item => item['Employee Name']))].length;
  const totalRecords = exportData.length;

  const attendanceRecords = exportData.map(record => {
    return `
      <tr>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 14px;">${record['Employee Name']}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 14px; text-align: center;">${record['RF ID']}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 14px;">${record['Date']}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 14px; text-align: center;">${record['Punch In']}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 14px; text-align: center;">${record['Punch Out']}</td>
        <td style="padding: 8px; border: 1px solid #ddd; font-size: 14px; text-align: right;">${record['Total Duration']}</td>
      </tr>
    `;
  }).join('');

  const reportHtml = `
    <div style="font-family: Arial, sans-serif; padding: 20px; max-width: 1000px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 3px solid #333; padding-bottom: 20px;">
        <h1 style="color: #333; margin: 0; font-size: 32px;">PVR Operations</h1>
        <p style="color: #666; font-size: 16px; margin: 10px 0 5px 0;">Attendance Tracking System</p>
      </div>
      
      <div style="text-align: center; margin-bottom: 30px;">
        <h2 style="color: #333; margin: 0; font-size: 28px;">ATTENDANCE REPORT</h2>
        <p style="color: #666; font-size: 18px; margin: 15px 0;">Generated on ${currentDate}</p>
      </div>
      
      <div style="margin-bottom: 30px; background-color: #f8f9fa; padding: 20px; border-radius: 8px; border: 1px solid #dee2e6;">
        <h3 style="color: #333; margin-top: 0; font-size: 20px;">Report Summary</h3>
        <div style="display: flex; justify-content: space-around; text-align: center;">
          <div>
            <p style="font-size: 16px; color: #666; margin: 0;">Total Employees</p>
            <p style="font-size: 28px; font-weight: bold; color: #333; margin: 10px 0 0 0;">${totalEmployees}</p>
          </div>
          <div>
            <p style="font-size: 16px; color: #666; margin: 0;">Total Records</p>
            <p style="font-size: 28px; font-weight: bold; color: #333; margin: 10px 0 0 0;">${totalRecords}</p>
          </div>
        </div>
      </div>
      
      <div style="margin-bottom: 30px;">
        <h3 style="color: #333; margin-bottom: 15px; font-size: 20px; padding-bottom: 10px; border-bottom: 2px solid #eee;">Detailed Attendance Records</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <thead>
            <tr style="background-color: #e9ecef;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 14px; font-weight: bold;">Employee Name</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 14px; font-weight: bold;">RF ID</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left; font-size: 14px; font-weight: bold;">Date</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 14px; font-weight: bold;">Punch In</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: center; font-size: 14px; font-weight: bold;">Punch Out</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: right; font-size: 14px; font-weight: bold;">Total Duration</th>
            </tr>
          </thead>
          <tbody>
            ${attendanceRecords}
          </tbody>
        </table>
      </div>
    </div>
  `;

  const opt = {
    margin: 15,
    filename: `attendance_report_${currentDate.replace(/\//g, '-')}.pdf`,
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
  };

  // html2pdf().from(reportHtml).set(opt).save();
  alert('PDF Export feature requires html2pdf.js. Please contact admin to enable.');
};

const formatTime = (dateString) => {
  if (!dateString) return '--:--';
  const date = new Date(dateString);
  let hours = date.getHours();
  const minutes = date.getMinutes().toString().padStart(2, '0');
  const seconds = date.getSeconds().toString().padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes}:${seconds} ${ampm}`;
};

const formatDate = (dateInput) => {
  if (!dateInput) return '--/--/----';
  let date = new Date(dateInput);
  if (isNaN(date.getTime())) return '--/--/----';
  return date.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
};
