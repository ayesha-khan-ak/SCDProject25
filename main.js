const readline = require('readline');
const db = require('./db');
require('./events/logger'); // Initialize event logger

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function menu() {
  console.log(`
===== NodeVault =====
1. Add Record
2. List Records
3. Update Record
4. Delete Record
5. Search Records
6. Sort Records
7. Export Data
8. View Vault Statistics
9. Exit
=====================
  `);

  rl.question('Choose option: ', ans => {
    switch (ans.trim()) {
      case '1':
        rl.question('Enter name: ', name => {
          rl.question('Enter value: ', value => {
            db.addRecord({ name, value });
            console.log('✅ Record added successfully!');
            menu();
          });
        });
        break;

      case '2':
        const records = db.listRecords();
        if (records.length === 0) console.log('No records found.');
        else records.forEach(r => console.log(`ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`));
        menu();
        break;

      case '3':
        rl.question('Enter record ID to update: ', id => {
          rl.question('New name: ', name => {
            rl.question('New value: ', value => {
              const updated = db.updateRecord(Number(id), name, value);
              console.log(updated ? '✅ Record updated!' : '❌ Record not found.');
              menu();
            });
          });
        });
        break;

      case '4':
        rl.question('Enter record ID to delete: ', id => {
          const deleted = db.deleteRecord(Number(id));
          console.log(deleted ? '🗑️ Record deleted!' : '❌ Record not found.');
          menu();
        });
        break;

	
      case '5':
        rl.question('Enter search keyword: ', keyword => {
          const results = db.searchRecords(keyword);
          if (results.length === 0) {
            console.log('No records found.');
          } else {
            console.log(`Found ${results.length} matching records:`);
            results.forEach((r, index) => {
              console.log(`${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
            });
          }
          menu();
        });
        break;

	      case '6':
        rl.question('Choose field to sort by (name/id): ', field => {
          rl.question('Choose order (ascending/descending): ', order => {
            if (['name', 'id'].includes(field.toLowerCase()) && 
                ['ascending', 'descending'].includes(order.toLowerCase())) {
              const sorted = db.sortRecords(field.toLowerCase(), order.toLowerCase());
              console.log('Sorted Records:');
              sorted.forEach((r, index) => {
                console.log(`${index + 1}. ID: ${r.id} | Name: ${r.name} | Value: ${r.value}`);
              });
            } else {
              console.log('Invalid field or order. Use: name/id and ascending/descending');
            }
            menu();
          });
        });
        break;


	case '7':
        const fileName = db.exportToTextFile();
        console.log(`Data exported successfully to ${fileName}`);
        menu();
        break;


	      case '8':
        const stats = db.getVaultStatistics();
        if (stats.totalRecords === 0) {
          console.log(stats.message);
        } else {
          console.log(`
Vault Statistics:
--------------------------
Total Records: ${stats.totalRecords}
Last Modified: ${stats.lastModified}
Longest Name: ${stats.longestName} (${stats.longestNameLength} characters)
Earliest Record: ${stats.earliestRecord}
Latest Record: ${stats.latestRecord}
--------------------------
          `);
        }
        menu();
        break;	

      case '9':
        console.log('👋 Exiting NodeVault...');
        rl.close();
        break;

      default:
        console.log('Invalid option.');
        menu();
    }
  });
}

menu();
