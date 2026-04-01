/**
 * Lights on/off button
 */
const themeToggleBtn = document.getElementById('theme-toggle');
const themeToggleText = document.getElementById('theme-toggle-text');
const body = document.body;
const themeKey = 'user-theme';

// 1. On page load, apply the saved theme or default to 'theme--light'
const savedTheme = localStorage.getItem(themeKey) || 'theme--light';
body.classList.add(savedTheme);
themeToggleBtn.checked = savedTheme === 'theme--dark' ? false : true;
themeToggleText.innerHTML = savedTheme === 'theme--dark' ? 'Turn Lights On' : 'Turn Lights Off';

// 2. Add an event listener to the toggle button
themeToggleBtn.addEventListener('click', () => {
  const currentTheme = localStorage.getItem(themeKey) || 'theme--light';
  const newTheme = currentTheme === 'theme--light' ? 'theme--dark' : 'theme--light';
  body.classList.toggle('theme--dark');
  body.classList.toggle('theme--light');
  themeToggleText.innerHTML = newTheme === 'theme--dark' ? 'Turn Lights On' : 'Turn Lights Off';
  // Save the new preference to localStorage
  localStorage.setItem(themeKey, newTheme);
});

/**
 * Obfuscate email
 */
function decodeEmail(str) {
  return str.replace(/[a-zA-Z]/g, function (c) {
    return String.fromCharCode((c <= 'Z' ? 90 : 122) >= (c = c.charCodeAt(0) + 13) ? c : c - 26);
  });
}
let email = decodeEmail('evpuneq@fghssagvat.pbz');
let emailElements = document.getElementsByClassName('email');

for (const element of emailElements) {
  element.innerHTML = '<a href="mailto:' + email + '">' + element.dataset.linkText + '</a>';
}
