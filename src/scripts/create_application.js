/**
 * Obsługa formularza tworzenia wniosku
 * Używa API udostępnionego przez preload.js do komunikacji z procesem głównym
 */

/**
 * Obsługa przesłania formularza
 */
async function handleFormSubmit(event) {
    event.preventDefault();

    // Pobierz dane z formularza
    const formData = {
        applicantName: document.getElementById('applicant-name').value.trim(),
        requestedAmount: document.getElementById('application-cost').value.trim(),
        fundingSource: document.getElementById('application-source').value.trim(),
        description: document.getElementById('application-description').value.trim()
    };

    // Walidacja
    if (!formData.applicantName || !formData.requestedAmount ||
        !formData.fundingSource || !formData.description) {
        alert('Wypełnij wszystkie pola formularza');
        return;
    }

    // Wyłącz przycisk podczas przetwarzania
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.textContent = 'Przetwarzanie...';

    try {
        // Wywołaj API przez preload
        const result = await window.electronAPI.createApplication(formData);

        alert(`Wniosek ${result.applicationNumber} został pomyślnie utworzony w arkuszu!`);
        document.getElementById('application-form').reset();
    } catch (error) {
        alert('Błąd podczas tworzenia wniosku: ' + error.message);
        console.error('Szczegóły błędu:', error);
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Złóż wniosek';
    }
}

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('application-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
});
