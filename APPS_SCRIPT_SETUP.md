# Konfiguracja Google Apps Script (Najprostsza metoda)

## Krok 1: Otwórz edytor Apps Script

1. Otwórz arkusz Google (ten z linku w database.json)
2. Kliknij **Rozszerzenia (Extensions)** > **Apps Script**

## Krok 2: Wklej kod skryptu

Skopiuj poniższy kod do edytora (zamień domyślny kod):

```javascript
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("wnioski");
    const lastRow = sheet.getLastRow();
    const nextRow = lastRow + 1;

    // Odczytaj ostatni numer wniosku z kolumny A (trim usuwa spacje)
    let nextNumber = 1;
    if (lastRow >= 1) {
      const lastApplicationCell = sheet.getRange(lastRow, 1).getValue();
      const cellText = lastApplicationCell.toString().trim();

      // Log dla debugowania (widoczny w View > Logs)
      Logger.log("Ostatnia komórka A" + lastRow + ": '" + cellText + "'");

      // Regex z opcjonalną spacją: "X/2026" lub "X /2026"
      const match = cellText.match(/^(\d+)\s*\/\s*2026$/);
      if (match) {
        nextNumber = parseInt(match[1]) + 1;
        Logger.log("Znaleziono numer: " + match[1] + ", następny: " + nextNumber);
      } else {
        Logger.log("Nie pasuje do formatu X/2026, numer = 1");
      }
    }

    const applicationNumber = nextNumber + "/2026";
    Logger.log("Nowy numer: " + applicationNumber);

    // Wstaw dane osobno (zamiast setValues - bezpieczniejsze dla formuł)
    sheet.getRange(nextRow, 1).setValue(applicationNumber);
    sheet.getRange(nextRow, 2).setValue(data.fundingSource);
    sheet.getRange(nextRow, 3).setValue(data.requestedAmount);
    sheet.getRange(nextRow, 4).setValue(data.applicantName);
    sheet.getRange(nextRow, 5).setValue(data.description);

    // Użyj setFormula dla polskiej nazwy funkcji
    const formula = "=SUMA.JEŻELI(Faktury!B:B; A" + nextRow + "; Faktury!C:C)";
    sheet.getRange(nextRow, 6).setFormula(formula);

    return ContentService.createTextOutput(JSON.stringify({
      success: true,
      row: nextRow,
      applicationNumber: applicationNumber
    })).setMimeType(ContentService.MimeType.JSON);

  } catch (error) {
    Logger.log("BŁĄD: " + error.toString());
    return ContentService.createTextOutput(JSON.stringify({
      success: false,
      error: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

## Krok 3: Zapisz projekt

Kliknij **Projekt (Project)** > **Zapisz (Save)** lub Ctrl+S
Nazwij projekt np. "BudgetApp"

## Krok 4: Wdróż jako Web App

1. Kliknij **Wdrażanie (Deploy)** > **Nowe wdrożenie (New deployment)**
2. Kliknij ikonę ustawień (⚙️) i wybierz **Web app**
3. Ustaw:
   - **Opis**: Budget API
   - **Wykonywane jako**: Ja (Twój email z Workspace)
   - **Dostęp**: Każdy (Anyone)
4. Kliknij **Wdrażaj (Deploy)**
5. Zezwól na uprawnienia (klikaj "Przejrzyj uprawnienia" > "Zezwól")

## Krok 5: Skopiuj URL

Po wdrożeniu skopiuj **Web App URL** (zaczyna się od `https://script.google.com/macros/s/...`)

## Krok 6: Dodaj URL do konfiguracji

Edytuj plik `src/databse.json` i dodaj pole `apiUrl`:

```json
{
    "url": "https://docs.google.com/spreadsheets/d/178mXRpwFfSFZwX6qPweTJMkcDOM2bCVnE_6wfl61ufw/edit?usp=sharing",
    "name": "Budżet na rok 2026",
    "apiUrl": "https://script.google.com/macros/s/TWÓJ_KOD/exec"
}
```

## Krok 7: Upewnij się, że arkusz ma zakładkę "wnioski"

Arkusz musi mieć zakładkę (dolną kartę) o nazwie **"wnioski"** z kolumnami:
- A: Numer wniosku
- B: Źródło finansowania
- C: Wnioskowana kwota
- D: Nadawca
- E: Opis
- F: Suma faktur (formuła)

## Gotowe!

Teraz aplikacja Electron będzie wysyłać dane przez HTTP POST do Apps Script. Numer wniosku jest generowany lokalnie (kolejny numer), a Apps Script dodaje wiersz do arkusza.
