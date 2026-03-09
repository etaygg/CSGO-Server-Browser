let allServers = [];
let currentIndex = 0;
const batchSize = Number(localStorage.getItem('batchSize')) || 20;

function saveSettings() {
    const alertbox = document.getElementById('alert');
    const timeout = 500;   
    const key = document.getElementById('apikey').value;
    const count = document.getElementById('serverCount').value;

    if (key) localStorage.setItem('apikey', key);
    if (count) localStorage.setItem('batchSize', count);
    alertbox.classList.remove('d-none');
    alertbox.classList.add('alert-success');
    alertbox.textContent = "Settings saved successfully!";
    setTimeout(() => { 
        window.location.href = 'index.html';
    }, timeout);
}
async function fetchServers() {
    const apikey = localStorage.getItem('apikey')
    const alertBox = document.getElementById('alerts');
    if (!alertBox) return;
    const url = `https://api.steampowered.com/IGameServersService/GetServerList/v1/?key=${apikey}&filter=\\appid\\4465480`;
    if (!apikey || apikey.trim() === "") {
        alertBox.classList.remove('d-none');
        alertBox.classList.add('alert-danger');
        alertBox.textContent = "Please enter your API key in settings.";
        return;
    }
    try {
        let command = await Neutralino.os.execCommand(`curl -s "${url}"`);
        const data = JSON.parse(command.stdOut);
        allServers = data.response.servers || [];

        currentIndex = 0;
        const serversDiv = document.getElementById('servers');
        if (serversDiv) serversDiv.innerHTML = '';
        renderNextBatch();
    } catch (e) {
        console.error("error fetching", e);
        alertBox.classList.remove('d-none');
        alertBox.classList.add('alert-danger');
        alertBox.textContent = "Error fetching servers. Please check your API key and try again.";
    }
}
function renderNextBatch() {
    const serverList = document.getElementById('servers');

    const batch = allServers.slice(currentIndex, currentIndex + batchSize);

    batch.forEach(server => {
        const html = `
            
                <b class="text-center">[${server.map}] ${server.name} | Players: ${server.players}/${server.max_players}</b>
                <button class="btnConnect p-2 fw-bold" onclick="connect('${server.addr}')">connect</button>
                <hr>
            `;
        serverList.insertAdjacentHTML('beforeend', html);
    });

    currentIndex += batchSize;

    const loadMoreBtn = document.getElementById('loadMoreBtn');
    if (loadMoreBtn) {
        loadMoreBtn.style.display = currentIndex < allServers.length ? 'block' : 'none';
    }
}
function connect(ip) {
    Neutralino.os.execCommand(`start steam://connect/${ip}`);
}

Neutralino.init();

window.onload = () => {
    fetchServers();
};