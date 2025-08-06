// Gestion du thème jour/nuit
function setThemeByHour() {
  const hour = new Date().getHours();
  const body = document.body;
  if (hour >= 6 && hour < 18) {
    body.classList.add('day-theme');
    body.classList.remove('night-theme');
  } else {
    body.classList.add('night-theme');
    body.classList.remove('day-theme');
  }
}
setThemeByHour();

// Validation JS avancée
function validateForm(event) {
  event.preventDefault();
  let valid = true;
  clearErrors();

  // Nom complet
  const fullname = document.getElementById('fullname');
  if (fullname.value.trim().length < 3 || fullname.value.trim().length > 50) {
    showError(fullname, '', 'fullname');
    valid = false;
  }

  // Email
  const email = document.getElementById('email');
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email.value.trim())) {
    showError(email, '', 'email');
    valid = false;
  }

  // Téléphone
  const phone = document.getElementById('phone');
  const phoneValue = phone.value.trim();
  const phonePattern = /^(6\d{8}|2376\d{8})$/;
  if (!phonePattern.test(phoneValue) || phoneValue.length < 9 || phoneValue.length > 12) {
    showError(phone, '', 'phone');
    valid = false;
  }

  // Date de naissance
  const birthdate = document.getElementById('birthdate');
  if (!birthdate.value) {
    showError(birthdate, '', 'birthdate');
    valid = false;
  } else {
    const dateValue = new Date(birthdate.value);
    const now = new Date();
    if (dateValue >= now) {
      showError(birthdate, '', 'birthdate');
      valid = false;
    }
  }

  // Adresse
  const address = document.getElementById('address');
  if (address.value.trim().length < 3) {
    showError(address, '', 'address');
    valid = false;
  }

  if (valid) {
    showSuccess();
  }
}

function showError(input, message, key) {
  let error = document.createElement('div');
  error.className = 'error-message';
  error.innerText = key ? window.getTranslation(key) : message;
  input.parentNode.insertBefore(error, input.nextSibling);
}

function clearErrors() {
  document.querySelectorAll('.error-message').forEach(e => e.remove());
}

function showSuccess() {
  // Créer le message de succès
  let success = document.createElement('div');
  success.className = 'success-message';
  success.innerHTML = `
    <div>
      <div style="font-size:1.15em; font-weight:600; margin-bottom:0.5em;">Enregistrement réussi !</div>
      <ul style="list-style:none; padding:0; margin:0;">
        <li><b>Nom complet :</b> ${document.getElementById('fullname').value}</li>
        <li><b>Email :</b> ${document.getElementById('email').value}</li>
        <li><b>Téléphone :</b> ${document.getElementById('phone').value}</li>
        <li><b>Date de naissance :</b> ${document.getElementById('birthdate').value}</li>
        <li><b>Adresse :</b> ${document.getElementById('address').value}</li>
      </ul>
    </div>
  `;
  
  // Ajouter le message au début du formulaire
  const form = document.getElementById('user-form');
  form.parentNode.insertBefore(success, form);
  
  // Vider tous les champs après l'enregistrement réussi
  document.getElementById('fullname').value = '';
  document.getElementById('email').value = '';
  document.getElementById('phone').value = '';
  document.getElementById('birthdate').value = '';
  document.getElementById('address').value = '';
  
  // Masquer le message de succès après 5 secondes
  setTimeout(() => {
    success.remove();
  }, 5000);
}

// Autocomplete adresse avec OpenStreetMap (Photon)
function setupAddressAutocomplete() {
  const addressInput = document.getElementById('address');
  const suggestionsBox = document.getElementById('address-suggestions');
  let debounceTimeout;

  addressInput.setAttribute('autocomplete', 'off');
  addressInput.setAttribute('aria-autocomplete', 'list');
  addressInput.setAttribute('aria-haspopup', 'true');
  addressInput.setAttribute('aria-expanded', 'false');
  suggestionsBox.setAttribute('role', 'listbox');

  addressInput.addEventListener('input', function() {
    const query = addressInput.value.trim();
    suggestionsBox.innerHTML = '';
    addressInput.setAttribute('aria-expanded', 'false');
    if (query.length < 3) return;
    clearTimeout(debounceTimeout);
    debounceTimeout = setTimeout(() => {
      fetch(`https://photon.komoot.io/api/?q=${encodeURIComponent(query)}&lang=fr&limit=5`)
        .then(res => res.json())
        .then(data => {
          suggestionsBox.innerHTML = '';
          if (data.features && data.features.length > 0) {
            data.features.forEach((feature, idx) => {
              const props = feature.properties;
              const label = [props.name, props.city, props.country].filter(Boolean).join(', ');
              const item = document.createElement('div');
              item.className = 'address-suggestion';
              item.innerText = label;
              item.setAttribute('tabindex', '0');
              item.setAttribute('role', 'option');
              item.addEventListener('click', () => {
                addressInput.value = label;
                suggestionsBox.innerHTML = '';
                addressInput.setAttribute('aria-expanded', 'false');
              });
              item.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                  item.click();
                }
              });
              suggestionsBox.appendChild(item);
            });
            addressInput.setAttribute('aria-expanded', 'true');
          }
        });
    }, 300);
  });
  // Cacher les suggestions si on clique ailleurs
  document.addEventListener('click', function(e) {
    if (!suggestionsBox.contains(e.target) && e.target !== addressInput) {
      suggestionsBox.innerHTML = '';
      addressInput.setAttribute('aria-expanded', 'false');
    }
  });
}

// Sélecteur de langue dynamique (français/anglais)
function setupLanguageSelector() {
  const translations = {
    fr: {
      fullname: 'Nom complet',
      email: 'Email',
      phone: 'Téléphone',
      birthdate: 'Date de naissance',
      address: 'Adresse',
      submit: 'Enregistrer',
      title: 'Collecte de données client',
      errors: {
        fullname: 'Le nom complet doit comporter entre 3 et 50 caractères.',
        email: 'Veuillez entrer un email valide.',
        phone: 'Numéro invalide (6XX... ou 2376..., 9 à 12 chiffres).',
        birthdate: 'La date de naissance doit être dans le passé.',
        address: 'Veuillez entrer une adresse valide.'
      }
    },
    en: {
      fullname: 'Full name',
      email: 'Email',
      phone: 'Phone',
      birthdate: 'Birth date',
      address: 'Address',
      submit: 'Submit',
      title: 'Client Data Collection',
      errors: {
        fullname: 'Full name must be between 3 and 50 characters.',
        email: 'Please enter a valid email.',
        phone: 'Invalid number (6XX... or 2376..., 9 to 12 digits).',
        birthdate: 'Birth date must be in the past.',
        address: 'Please enter a valid address.'
      }
    }
  };
  let currentLang = 'fr';
  const langSelector = document.createElement('div');
  langSelector.className = 'language-selector';
  langSelector.innerHTML = `
    <button type="button" data-lang="fr" class="active">FR</button>
    <button type="button" data-lang="en">EN</button>
  `;
  document.querySelector('.form-container').prepend(langSelector);
  langSelector.addEventListener('click', function(e) {
    if (e.target.tagName === 'BUTTON') {
      currentLang = e.target.getAttribute('data-lang');
      langSelector.querySelectorAll('button').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
      translateForm();
    }
  });
  function translateForm() {
    document.querySelector('#fullname').placeholder = currentLang === 'fr' ? 'Entrez le nom complet' : 'Enter full name';
    document.querySelector('#email').placeholder = currentLang === 'fr' ? 'Entrez l\'adresse email' : 'Enter email address';
    document.querySelector('#phone').placeholder = currentLang === 'fr' ? 'Entrez le numéro de téléphone' : 'Enter phone number';
    document.querySelector('#birthdate').placeholder = currentLang === 'fr' ? 'Sélectionnez la date de naissance' : 'Select date of birth';
    document.querySelector('#address').placeholder = currentLang === 'fr' ? 'Commencez à taper pour rechercher une adresse' : 'Start typing to search address';
    document.querySelector('button[type="submit"]').innerText = translations[currentLang].submit;
    // Traduction dynamique du titre
    const title = document.querySelector('.form-container h2');
    if (title) title.innerText = translations[currentLang].title;
  }
  // Pour la validation dynamique
  window.getTranslation = function(key) {
    return translations[currentLang].errors[key] || key;
  };
}

// Amélioration accessibilité autocomplete (navigation clavier)
document.addEventListener('keydown', function(e) {
  const suggestionsBox = document.getElementById('address-suggestions');
  if (!suggestionsBox || suggestionsBox.children.length === 0) return;
  let focused = document.activeElement;
  if (e.key === 'ArrowDown') {
    e.preventDefault();
    if (focused.classList.contains('address-suggestion')) {
      if (focused.nextSibling) focused.nextSibling.focus();
    } else {
      suggestionsBox.firstChild.focus();
    }
  } else if (e.key === 'ArrowUp') {
    e.preventDefault();
    if (focused.classList.contains('address-suggestion')) {
      if (focused.previousSibling) focused.previousSibling.focus();
    }
  } else if (e.key === 'Enter' && focused.classList.contains('address-suggestion')) {
    focused.click();
  }
});

document.addEventListener('DOMContentLoaded', function() {
  setThemeByHour();
  setupAddressAutocomplete();
  setupLanguageSelector();
  document.getElementById('user-form').addEventListener('submit', validateForm);
}); 