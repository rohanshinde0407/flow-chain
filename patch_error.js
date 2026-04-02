const fs = require('fs');
const code = fs.readFileSync('src/main.jsx', 'utf8');
const patch = `
window.onerror = function(msg, url, lineNo, columnNo, error) {
  document.body.innerHTML += '<div style="position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:2rem;font-size:1.5rem;width:100vw;height:100vh;"><h1>CRASH</h1><pre>' + msg + '\\n' + (error && error.stack) + '</pre></div>';
};
window.onunhandledrejection = function(event) {
  document.body.innerHTML += '<div style="position:fixed;top:0;left:0;z-index:9999;background:red;color:white;padding:2rem;font-size:1.5rem;width:100vw;height:100vh;"><h1>CRASH PROMISE</h1><pre>' + (event.reason && event.reason.stack || event.reason) + '</pre></div>';
};
`;
if (!code.includes('CRASH')) {
  fs.writeFileSync('src/main.jsx', patch + code);
}
