const fileDB = require('./file');
const recordUtils = require('./record');
const vaultEvents = require('../events');

function addRecord({ name, value }) {
  recordUtils.validateRecord({ name, value });
  const data = fileDB.readDB();
  const newRecord = { id: recordUtils.generateId(), name, value };
  data.push(newRecord);
  fileDB.writeDB(data);
  vaultEvents.emit('recordAdded', newRecord);
createBackup();
  return newRecord;
}

function listRecords() {
  return fileDB.readDB();
}

function updateRecord(id, newName, newValue) {
  const data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  record.name = newName;
  record.value = newValue;
  fileDB.writeDB(data);
  vaultEvents.emit('recordUpdated', record);
  return record;
}

function deleteRecord(id) {
  let data = fileDB.readDB();
  const record = data.find(r => r.id === id);
  if (!record) return null;
  data = data.filter(r => r.id !== id);
  fileDB.writeDB(data);
  vaultEvents.emit('recordDeleted', record);
createBackup();
  return record;
}

// ADD THIS SEARCH FUNCTION
function searchRecords(searchTerm) {
  const data = fileDB.readDB();
  const term = searchTerm.toLowerCase();
  
  return data.filter(record => 
    record.name.toLowerCase().includes(term) || 
    record.id.toString().includes(term)
  );
}

// sorting function
function sortRecords(field, order) {
  const data = fileDB.readDB();
  
  return data.sort((a, b) => {
    let aValue, bValue;
    
    if (field === 'name') {
      aValue = a.name.toLowerCase();
      bValue = b.name.toLowerCase();
    } else if (field === 'id') {
      aValue = a.id;
      bValue = b.id;
    } else {
      return 0;
    }
    
    if (order === 'ascending') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
}
// add export function
const fs = require('fs');
const path = require('path');

function exportToTextFile() {
  const data = fileDB.readDB();
  const timestamp = new Date().toLocaleString();
  const fileName = 'export.txt';
  
  let content = `=== NodeVault Data Export ===\n`;
  content += `Export Date: ${timestamp}\n`;
  content += `Total Records: ${data.length}\n`;
  content += `File: ${fileName}\n`;
  content += `=============================\n\n`;
  
  data.forEach((record, index) => {
    content += `Record ${index + 1}:\n`;
    content += `  ID: ${record.id}\n`;
    content += `  Name: ${record.name}\n`;
    content += `  Value: ${record.value}\n`;
    content += `  Created: ${new Date(record.id).toLocaleString()}\n`;
    content += `-----------------------------\n`;
  });
  
  fs.writeFileSync(path.join(__dirname, '..', fileName), content);
  return fileName;
}
//backup function
function createBackup() {
  const data = fileDB.readDB();
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupDir = path.join(__dirname, '..', 'backups');
  const fileName = `backup_${timestamp}.json`;
  
  // Create backups directory if it doesn't exist
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }
  
  const backupPath = path.join(backupDir, fileName);
  fs.writeFileSync(backupPath, JSON.stringify(data, null, 2));
  console.log(`Backup created successfully: ${fileName}`);
  return fileName;
}

//add statictic function
function getVaultStatistics() {
  const data = fileDB.readDB();
  
  if (data.length === 0) {
    return {
      totalRecords: 0,
      message: "No records in vault"
    };
  }

  // Get all timestamps (IDs are timestamps)
  const timestamps = data.map(record => record.id);
  const names = data.map(record => record.name);
  
  // Find longest name
  const longestName = names.reduce((longest, current) => 
    current.length > longest.length ? current : longest, "");
  
  // Get file modification time
  const vaultPath = path.join(__dirname, '..', 'data', 'vault.json');
  const stats = fs.statSync(vaultPath);
  const lastModified = stats.mtime;
  
  return {
    totalRecords: data.length,
    lastModified: lastModified.toLocaleString(),
    longestName: longestName,
    longestNameLength: longestName.length,
    earliestRecord: new Date(Math.min(...timestamps)).toLocaleDateString(),
    latestRecord: new Date(Math.max(...timestamps)).toLocaleDateString()
  };
}
// UPDATE EXPORTS TO INCLUDE SEARCH
module.exports = { addRecord, listRecords, updateRecord, deleteRecord, searchRecords, sortRecords, exportToTextFile, getVaultStatistics };
