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
    // Si la validation côté client passe, soumettre le formulaire au serveur
    event.target.submit();
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

// La fonction showSuccess() a été supprimée car le succès est géré côté serveur

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

// Fonction pour basculer l'affichage de la liste des utilisateurs
function toggleUserList() {
  const listSection = document.getElementById('user-list-section');
  const listBtn = document.getElementById('list-btn');
  
  if (listSection.style.display === 'none') {
    // Afficher la liste
    listSection.style.display = 'block';
    listBtn.textContent = 'Masquer';
    listBtn.style.background = '#dc2626';
    loadUserList();
    
    // Scroll vers la liste
    listSection.scrollIntoView({ behavior: 'smooth' });
  } else {
    // Masquer la liste
    listSection.style.display = 'none';
    listBtn.textContent = 'Liste';
    listBtn.style.background = '#059669';
  }
}

// Fonction pour charger la liste des utilisateurs
function loadUserList() {
  const loading = document.getElementById('loading');
  const container = document.getElementById('user-table-container');
  
  loading.style.display = 'block';
  container.innerHTML = '';
  
  fetch('/users')
    .then(response => response.json())
    .then(data => {
      loading.style.display = 'none';
      
      if (data.success && data.data && data.data.length > 0) {
        displayUserTable(data.data);
      } else {
        container.innerHTML = '<p style="text-align: center; color: #6b7280;">Aucun enregistrement trouvé.</p>';
      }
    })
    .catch(error => {
      loading.style.display = 'none';
      container.innerHTML = '<p style="text-align: center; color: #dc2626;">Erreur lors du chargement des données.</p>';
      console.error('Erreur:', error);
    });
}

// Fonction pour afficher le tableau des utilisateurs
function displayUserTable(users) {
  const container = document.getElementById('user-table-container');
  let tableHTML = `
    <div style="overflow-x: auto;">
      <table style="width: 100%; border-collapse: collapse; margin: 1rem 0; background: white; border-radius: 0.75rem; overflow: hidden; box-shadow: 0 4px 12px -2px rgba(99,102,241,0.10); color: #22223b; font-size: 1rem;">
        <thead>
          <tr style="background: #6366f1; color: #fff;">
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">ID</th>
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">Nom complet</th>
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">Email</th>
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">Téléphone</th>
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">Date de naissance</th>
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">Adresse</th>
            <th style="padding: 1.1rem 1.2rem; text-align: left; font-weight: 700; border-bottom: 2px solid #cbd5e1;">Date création</th>
          </tr>
        </thead>
        <tbody>
  `;
  users.forEach((user, index) => {
    const rowColor = index % 2 === 0 ? '#fff' : '#f1f5f9';
    tableHTML += `
      <tr style="background: ${rowColor}; transition: background 0.2s;" onmouseover="this.style.background='#e0e7ff'" onmouseout="this.style.background='${rowColor}'">
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1;">${user.id}</td>
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1; font-weight: 600;">${user.fullname}</td>
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1;">${user.email}</td>
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1;">${user.phone}</td>
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1;">${user.birthdate || 'N/A'}</td>
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1; max-width: 220px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${user.address}">${user.address}</td>
        <td style="padding: 1rem 1.2rem; border-bottom: 1px solid #cbd5e1;">${user.created_at || 'N/A'}</td>
      </tr>
    `;
  });
  tableHTML += `
        </tbody>
      </table>
    </div>
    <p style="text-align: center; color: #6366f1; margin-top: 1rem; font-weight: 600;">Total: ${users.length} enregistrement(s)</p>
  `;
  container.innerHTML = tableHTML;
}

document.addEventListener('DOMContentLoaded', function() {
  setThemeByHour();
  setupAddressAutocomplete();
  setupLanguageSelector();
  document.getElementById('user-form').addEventListener('submit', validateForm);
}); 