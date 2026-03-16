import { stringify } from 'csv-stringify/sync';
import ExcelJS from 'exceljs';

export const generateCSV = (data, filename) => {
  try {
    const csv = stringify(data, {
      header: true,
      columns: Object.keys(data[0] || {})
    });
    return csv;
  } catch (error) {
    throw new Error(`CSV generation failed: ${error.message}`);
  }
};

export const generateExcel = async (data, filename) => {
  try {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Data');

    if (data.length === 0) {
      worksheet.addRow(['No data available']);
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    }

    // Add headers
    const headers = Object.keys(data[0]);
    worksheet.addRow(headers);

    // Style header row
    const headerRow = worksheet.getRow(1);
    headerRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF3b82f6' }
    };
    headerRow.alignment = { horizontal: 'center', vertical: 'center' };

    // Add data rows
    data.forEach(row => {
      worksheet.addRow(Object.values(row));
    });

    // Auto-fit columns
    worksheet.columns.forEach(column => {
      let maxLength = 0;
      column.eachCell({ includeEmpty: true }, cell => {
        const cellLength = cell.value ? String(cell.value).length : 0;
        if (cellLength > maxLength) {
          maxLength = cellLength;
        }
      });
      column.width = Math.min(maxLength + 2, 50);
    });

    const buffer = await workbook.xlsx.writeBuffer();
    return buffer;
  } catch (error) {
    throw new Error(`Excel generation failed: ${error.message}`);
  }
};

export const formatUserData = (users) => {
  return users.map(user => ({
    'ID': user._id?.toString() || '',
    'Name': user.name || '',
    'Email': user.email || '',
    'Phone': user.phone || '',
    'Role': user.role || '',
    'User Type': user.userType || '',
    'College': user.college || '',
    'Department': user.department || '',
    'Year': user.year || '',
    'Organization': user.organization || '',
    'Created At': new Date(user.createdAt).toLocaleDateString()
  }));
};

export const formatRegistrationData = (registrations) => {
  return registrations.map(reg => ({
    'ID': reg._id?.toString() || '',
    'User Name': reg.userSnapshot?.name || '',
    'User Email': reg.userSnapshot?.email || '',
    'User Phone': reg.userSnapshot?.phone || '',
    'Event/Course': reg.event?.title || reg.course?.title || '',
    'Type': reg.type || '',
    'Status': reg.status || '',
    'Registered At': new Date(reg.createdAt).toLocaleDateString(),
    'Attended': reg.attended ? 'Yes' : 'No'
  }));
};
