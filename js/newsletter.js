/**
 * Newsletter Subscription Handler
 * Verarbeitet die Anmeldung zum Newsletter
 */
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    const newsletterSuccess = document.querySelector('.newsletter-success');
    
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const emailInput = this.querySelector('input[type="email"]');
            const email = emailInput.value.trim();
            
            if (!email) {
                showError('Bitte gib eine E-Mail-Adresse ein.');
                return;
            }
            
            // Formular ausblenden und Ladeanimation anzeigen
            newsletterForm.classList.add('loading');
            
            // API-Anfrage an den Newsletter-Service senden
            fetch('/newsletter/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email })
            })
            .then(response => response.json())
            .then(data => {
                newsletterForm.classList.remove('loading');
                
                if (data.success) {
                    // Erfolgreiche Anmeldung
                    newsletterForm.style.display = 'none';
                    newsletterSuccess.style.display = 'flex';
                    
                    // Formular zurücksetzen
                    emailInput.value = '';
                    
                    // Nach 5 Sekunden das Erfolgssymbol ausblenden und Formular wieder anzeigen
                    setTimeout(() => {
                        newsletterSuccess.style.display = 'none';
                        newsletterForm.style.display = 'flex';
                    }, 5000);
                } else {
                    // Fehler bei der Anmeldung
                    showError(data.message || 'Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
                }
            })
            .catch(error => {
                console.error('Newsletter subscription error:', error);
                newsletterForm.classList.remove('loading');
                showError('Ein Fehler ist aufgetreten. Bitte versuche es später erneut.');
            });
        });
    }
    
    function showError(message) {
        // Fehlermeldung anzeigen
        const errorElement = document.createElement('div');
        errorElement.className = 'newsletter-error';
        errorElement.textContent = message;
        
        // Vorhandene Fehlermeldungen entfernen
        const existingError = document.querySelector('.newsletter-error');
        if (existingError) {
            existingError.remove();
        }
        
        // Fehlermeldung nach dem Formular einfügen
        newsletterForm.insertAdjacentElement('afterend', errorElement);
        
        // Fehlermeldung nach 3 Sekunden ausblenden
        setTimeout(() => {
            errorElement.remove();
        }, 3000);
    }
});
