const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('node:path')
const fs = require('fs')

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1000,
    height: 1000,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  })

  mainWindow.loadFile('src/index.html')
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// ===== GOOGLE APPS SCRIPT INTEGRATION =====

const DATABASE_PATH = path.join(__dirname, 'src', 'database.json');

function readDatabase() {
  const data = fs.readFileSync(DATABASE_PATH, 'utf8');
  return JSON.parse(data);
}

// IPC handler for creating application
ipcMain.handle('create-application', async (event, formData) => {
  try {
    const db = readDatabase();

    if (!db.apiUrl) {
      throw new Error('Brak apiUrl w database.json. Dodaj URL z Apps Script.');
    }

    // Przygotuj dane do wysłania (bez numeru wniosku - Apps Script go wygeneruje)
    const postData = {
      fundingSource: formData.fundingSource,
      requestedAmount: formData.requestedAmount,
      applicantName: formData.applicantName,
      description: formData.description
    };

    // Wyślij do Apps Script przez HTTP POST
    const response = await fetch(db.apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.error || 'Nieznany błąd');
    }

    // Numer wniosku zwrócony przez Apps Script
    return {
      success: true,
      applicationNumber: result.applicationNumber,
      row: result.row
    };

  } catch (error) {
    console.error('Błąd:', error);
    throw error;
  }
});
