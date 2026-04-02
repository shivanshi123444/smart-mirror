// modules/clock.js
function getTime() {
  const n = new Date();
  return `${String(n.getHours()).padStart(2,'0')}:${String(n.getMinutes()).padStart(2,'0')}:${String(n.getSeconds()).padStart(2,'0')}`;
}
function getDate() {
  const n = new Date();
  const days = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${days[n.getDay()]}, ${n.getDate()} ${months[n.getMonth()]} ${n.getFullYear()}`;
}
function getGreeting(name = 'User') {
  const h = new Date().getHours();
  if (h < 12) return `Good Morning, ${name}`;
  if (h < 17) return `Good Afternoon, ${name}`;
  if (h < 21) return `Good Evening, ${name}`;
  return `Good Night, ${name}`;
}
module.exports = { getTime, getDate, getGreeting };
