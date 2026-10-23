// App Configurations
const appConfigs = {
    mindmap: { title: 'Mind Map', icon: 'fa-sitemap text-cyan-600', url: 'https://ntoolz.github.io/mindmap/', width: 900, height: 550 },
    stickynote: { title: 'Sticky Notes', icon: 'fa-note-sticky text-amber-500', url: 'https://ntoolz.github.io/stickynote/', width: 900, height: 500 },
    mpw: { title: 'Password Generator', icon: 'fa-key text-emerald-600', url: 'https://ntoolz.github.io/mpw/', width: 700, height: 700 },
    gi: { title: 'Glycemic Index', icon: 'fa-key text-rose-600', url: 'url_encoder_decoder.html', width: 700, height: 500 }
};

// SHA-512 Hashing setup on startup
async function sha512(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-512', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

window.addEventListener('DOMContentLoaded', async () => {
    const defaultPassHash = "19e03fea559200fef5a39632bf4a5dd49e4ac47f1c3e4106c47cb50c856a77338bb52945427bd1be8858ca9faebab3440f9767a825128c893e77629afa111de7"; //await sha512('abc@123');
    sessionStorage.setItem('user_hash', defaultPassHash);
});

async function handleLogin(e) {
    e.preventDefault();
    const inputVal = document.getElementById('login-password').value;
    const inputHash = await sha512(inputVal);
    const storedHash = sessionStorage.getItem('user_hash');

    if (inputHash === storedHash) {
        document.getElementById('login-screen').style.display = 'none';
        sessionStorage.setItem('login_hash', inputHash);
        evaluateUser();
    } 
    else {
        document.getElementById('login-error').innerText = 'Incorrect password. Try again';
    }
}

async function evaluateUser(){

    var _recheck = ()=>{
        const user_hash = sessionStorage.getItem('user_hash');
        const login_hash = sessionStorage.getItem('login_hash');

        if (user_hash != login_hash)
        {
            console.log("invalid user");
            //document.getElementById('login-screen').style.display = 'block';
            document.write("Invalid unauthorized user, Session ended");
        }
    };

    setInterval(_recheck, 3000);

}


let zIndexCounter = 50;
let activeWindows = {};

// Clock and Date update
function updateClock() {
    const now = new Date();
    let hours = now.getHours();
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12 || 12;
    document.getElementById('taskbar-time').innerText = `${hours}:${minutes} ${ampm}`;
    document.getElementById('taskbar-date').innerText = now.toLocaleDateString();
}
setInterval(updateClock, 1000);
updateClock();

// Desktop icon selection
function selectIcon(el) {
    document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    el.classList.add('selected');
}
document.addEventListener('click', (e) => {
    if (!e.target.closest('.desktop-icon') && !e.target.closest('.app-window')) {
        document.querySelectorAll('.desktop-icon').forEach(i => i.classList.remove('selected'));
    }
});

function toggleStartMenu() {
    document.getElementById('start-menu').classList.toggle('open');
}

function showMsg(title, text) {
    document.getElementById('msgbox-title').innerText = title;
    document.getElementById('msgbox-text').innerText = text;
    document.getElementById('custom-msgbox').classList.remove('hidden');
}
function closeMsgBox() {
    document.getElementById('custom-msgbox').classList.add('hidden');
}



function openApp(appId) {
    document.getElementById('start-menu').classList.remove('open');

    if (activeWindows[appId]) {
        const win = document.getElementById(`window-${appId}`);
        if (win.classList.contains('minimized')) {
            win.classList.remove('minimized');
        }
        focusWindow(appId);
        return;
    }

    const config = appConfigs[appId];
    if (!config) return;

    zIndexCounter++;
    const win = document.createElement('div');
    win.id = `window-${appId}`;
    win.className = 'app-window win-shadow';
    win.style.width = `${config.width}px`;
    win.style.height = `${config.height}px`;
    win.style.left = `${Math.max(50, (window.innerWidth - config.width) / 2 + (Object.keys(activeWindows).length * 25))}px`;
    win.style.top = `${Math.max(40, (window.innerHeight - config.height) / 2 + (Object.keys(activeWindows).length * 25))}px`;
    win.style.zIndex = zIndexCounter;

    win.innerHTML = `
        <div class="window-header h-10 bg-slate-100 border-b border-slate-200 flex items-center justify-between px-3 cursor-grab" onmousedown="startDrag(event, '${appId}')">
            <div class="flex items-center space-x-2 pointer-events-none">
                <i class="fa-solid ${config.icon} text-sm"></i>
                <span class="text-xs font-medium text-slate-700">${config.title}</span>
            </div>
            <div class="flex items-center space-x-1" onmousedown="event.stopPropagation()">
                <button onclick="minimizeWindow('${appId}')" class="w-8 h-8 hover:bg-slate-200 rounded flex items-center justify-center text-slate-600 text-xs"><i class="fa-solid fa-minus"></i></button>
                <button onclick="maximizeWindow('${appId}')" class="w-8 h-8 hover:bg-slate-200 rounded flex items-center justify-center text-slate-600 text-xs"><i class="fa-regular fa-square"></i></button>
                <button onclick="closeWindow('${appId}')" class="w-8 h-8 hover:bg-red-500 hover:text-white rounded flex items-center justify-center text-slate-600 text-xs"><i class="fa-solid fa-xmark"></i></button>
            </div>
        </div>
        <div class="flex-1 bg-white relative flex flex-col" onclick="focusWindow('${appId}')">
            <iframe src="${config.url}" class="w-full h-full border-0"></iframe>
        </div>
        <div class="resizer resizer-r" onmousedown="initResize(event, '${appId}', 'r')"></div>
        <div class="resizer resizer-b" onmousedown="initResize(event, '${appId}', 'b')"></div>
        <div class="resizer resizer-br" onmousedown="initResize(event, '${appId}', 'br')"></div>
        <div class="resizer resizer-l" onmousedown="initResize(event, '${appId}', 'l')"></div>
        <div class="resizer resizer-t" onmousedown="initResize(event, '${appId}', 't')"></div>
    `;

    document.getElementById('windows-container').appendChild(win);
    activeWindows[appId] = { maximized: false, prevStyle: {} };

    addTaskbarAppIcon(appId, config);
    focusWindow(appId);
}

function focusWindow(appId) {
    zIndexCounter++;
    const win = document.getElementById(`window-${appId}`);
    if (win) win.style.zIndex = zIndexCounter;
    document.querySelectorAll('.taskbar-app-btn').forEach(btn => btn.classList.remove('active'));
    const tBtn = document.getElementById(`taskbar-btn-${appId}`);
    if (tBtn) tBtn.classList.add('active');
}

function minimizeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    win.classList.add('minimized');
    const tBtn = document.getElementById(`taskbar-btn-${appId}`);
    if (tBtn) tBtn.classList.remove('active');
}

function maximizeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    const state = activeWindows[appId];
    if (!state.maximized) {
        state.prevStyle = { left: win.style.left, top: win.style.top, width: win.style.width, height: win.style.height, borderRadius: win.style.borderRadius };
        win.style.left = '0px';
        win.style.top = '0px';
        win.style.width = '100vw';
        win.style.height = 'calc(100vh - 48px)';
        win.style.borderRadius = '0px';
        state.maximized = true;
    } else {
        win.style.left = state.prevStyle.left;
        win.style.top = state.prevStyle.top;
        win.style.width = state.prevStyle.width;
        win.style.height = state.prevStyle.height;
        win.style.borderRadius = '8px';
        state.maximized = false;
    }
    focusWindow(appId);
}

function closeWindow(appId) {
    const win = document.getElementById(`window-${appId}`);
    if (win) win.remove();
    const tBtn = document.getElementById(`taskbar-btn-${appId}`);
    if (tBtn) tBtn.remove();
    delete activeWindows[appId];
}

function addTaskbarAppIcon(appId, config) {
    if (document.getElementById(`taskbar-btn-${appId}`)) return;
    const container = document.getElementById('taskbar-apps');
    const btn = document.createElement('div');
    btn.id = `taskbar-btn-${appId}`;
    btn.className = 'taskbar-item taskbar-app-btn';
    btn.title = config.title;
    btn.innerHTML = `<i class="fa-solid ${config.icon} text-lg"></i>`;
    btn.onclick = () => {
        const win = document.getElementById(`window-${appId}`);
        if (win.classList.contains('minimized')) {
            win.classList.remove('minimized');
            focusWindow(appId);
        } else if (win.style.zIndex != zIndexCounter) {
            focusWindow(appId);
        } else {
            minimizeWindow(appId);
        }
    };
    container.appendChild(btn);
}

// Draggable Windows Logic
let dragItem = null, startX = 0, startY = 0, initialX = 0, initialY = 0;
function startDrag(e, appId) {
    if (activeWindows[appId].maximized) return;
    dragItem = document.getElementById(`window-${appId}`);
    focusWindow(appId);
    startX = e.clientX;
    startY = e.clientY;
    initialX = dragItem.offsetLeft;
    initialY = dragItem.offsetTop;

    document.addEventListener('mousemove', elementDrag);
    document.addEventListener('mouseup', closeDragElement);
}

function elementDrag(e) {
    if (!dragItem) return;
    const dx = e.clientX - startX;
    const dy = e.clientY - startY;
    dragItem.style.left = `${initialX + dx}px`;
    dragItem.style.top = `${Math.max(0, initialY + dy)}px`;
}

function closeDragElement() {
    dragItem = null;
    document.removeEventListener('mousemove', elementDrag);
    document.removeEventListener('mouseup', closeDragElement);
}

// Resizable Windows Logic
let resizeWin = null, resizeDir = '', rStartX = 0, rStartY = 0, rStartW = 0, rStartH = 0, rStartL = 0, rStartT = 0;
function initResize(e, appId, dir) {
    if (activeWindows[appId].maximized) return;
    resizeWin = document.getElementById(`window-${appId}`);
    resizeDir = dir;
    focusWindow(appId);
    rStartX = e.clientX;
    rStartY = e.clientY;
    rStartW = resizeWin.offsetWidth;
    rStartH = resizeWin.offsetHeight;
    rStartL = resizeWin.offsetLeft;
    rStartT = resizeWin.offsetTop;

    document.addEventListener('mousemove', elementResize);
    document.addEventListener('mouseup', closeResizeElement);
    e.stopPropagation();
}

function elementResize(e) {
    if (!resizeWin) return;
    const dx = e.clientX - rStartX;
    const dy = e.clientY - rStartY;

    if (resizeDir.includes('r')) {
        resizeWin.style.width = `${Math.max(300, rStartW + dx)}px`;
    }
    if (resizeDir.includes('b')) {
        resizeWin.style.height = `${Math.max(200, rStartH + dy)}px`;
    }
    if (resizeDir.includes('l')) {
        const newW = rStartW - dx;
        if (newW >= 300) {
            resizeWin.style.width = `${newW}px`;
            resizeWin.style.left = `${rStartL + dx}px`;
        }
    }
    if (resizeDir.includes('t')) {
        const newH = rStartH - dy;
        if (newH >= 200) {
            resizeWin.style.height = `${newH}px`;
            resizeWin.style.top = `${rStartT + dy}px`;
        }
    }
}

function closeResizeElement() {
    resizeWin = null;
    resizeDir = '';
    document.removeEventListener('mousemove', elementResize);
    document.removeEventListener('mouseup', closeResizeElement);
}

//custom
class DesktopIcon extends HTMLElement {
  connectedCallback() {
    const app = this.getAttribute('app') || '';
    const icon = this.getAttribute('icon') || 'fa-file';
    const color = this.getAttribute('color') || 'text-slate-600';
    const label = this.getAttribute('label') || 'New App';

    // FIX 1: Ensure the custom element behaves as a flex block, allowing height expansion
    this.className = 'desktop-icon cursor-pointer flex flex-col items-center justify-start p-2 h-auto';

    this.addEventListener('click', () => {
      if (typeof selectIcon === 'function') selectIcon(this);
    });

    this.addEventListener('dblclick', () => {
      if (typeof openApp === 'function') openApp(app);
    });

    // FIX 2: Modified 'line-clamp-2' to 'break-words whitespace-normal' to prevent browser truncation
    this.innerHTML = `
      <div class="w-11 h-11 flex items-center justify-center ${color} text-2xl drop-shadow-sm select-none">
        <i class="fa-solid ${icon}"></i>
      </div>
      <span class="text-xs text-slate-800 text-center mt-1 font-medium drop-shadow-sm px-1 break-words whitespace-normal normal-case w-full">
        ${label}
      </span>
    `;
  }
}

customElements.define('desktop-icon', DesktopIcon);
