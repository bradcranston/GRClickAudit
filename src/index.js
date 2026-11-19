  // Global Set to track already added row keys
  const addedRowKeys = new Set();

  window.loadClickAuditReport = function (json) {
    const data = JSON.parse(json);
    const tableBody = document.querySelector('#auditTable tbody');
    tableBody.innerHTML = ''; // Clear table

    if (!data || !Array.isArray(data.value)) {
      console.error('Invalid data format');
      return;
    }

    const grouped = {};

    data.value.forEach(entry => {
      const { buttonName = '', user = '', date = '' } = entry;

      if (!grouped[buttonName]) {
        grouped[buttonName] = {
          userCounts: {},
          latestDate: date,
          count: 0
        };
      }

      const group = grouped[buttonName];
      group.count++;
      group.latestDate = (!group.latestDate || new Date(date) > new Date(group.latestDate)) ? date : group.latestDate;

      group.userCounts[user] = (group.userCounts[user] || 0) + 1;
    });

    Object.entries(grouped).forEach(([buttonName, group]) => {
      // Determine most frequent user
      const mostFrequentUser = Object.entries(group.userCounts)
        .sort((a, b) => b[1] - a[1])[0][0];

      const row = document.createElement('tr');

      const buttonCell = document.createElement('td');
      buttonCell.textContent = buttonName;
      row.appendChild(buttonCell);

      const userCell = document.createElement('td');
      userCell.textContent = mostFrequentUser;
      row.appendChild(userCell);

      const dateCell = document.createElement('td');
      dateCell.textContent = group.latestDate;
      row.appendChild(dateCell);

      const countCell = document.createElement('td');
      countCell.textContent = group.count;
      row.appendChild(countCell);

      tableBody.appendChild(row);
    });
  };

  window.clearClickAuditReport = function () {
    const tableBody = document.querySelector('#auditTable tbody');
    tableBody.innerHTML = '';
  };

  // Sorting logic
  document.addEventListener('DOMContentLoaded', () => {
    const table = document.getElementById('auditTable');
    const headers = table.querySelectorAll('th.sortable');
    let sortDirection = 1;
    let currentColumn = '';

    headers.forEach((th, index) => {
      th.addEventListener('click', () => {
        const tbody = table.querySelector('tbody');
        const rows = Array.from(tbody.querySelectorAll('tr'));
        const column = th.getAttribute('data-column');

        // Determine column index
        let getCellValue = (row) => row.children[index].textContent;

        // Determine type for comparison
        const isDate = column === 'date';
        const isNumber = column === 'count';

        rows.sort((a, b) => {
          let valA = getCellValue(a);
          let valB = getCellValue(b);

          if (isNumber) {
            valA = parseInt(valA);
            valB = parseInt(valB);
          } else if (isDate) {
            valA = new Date(valA);
            valB = new Date(valB);
          } else {
            valA = valA.toLowerCase();
            valB = valB.toLowerCase();
          }

          if (valA < valB) return -1 * sortDirection;
          if (valA > valB) return 1 * sortDirection;
          return 0;
        });

        // Toggle sort direction if same column clicked
        if (currentColumn === column) {
          sortDirection *= -1;
        } else {
          sortDirection = 1;
          currentColumn = column;
        }

        // Re-add sorted rows
        tbody.innerHTML = '';
        rows.forEach(row => tbody.appendChild(row));
      });
    });
  });