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
async function updateServerPing(addr, serverID) {
    try {
        const ip = addr.split(':')[0]
        const command = await Neutralino.os.execCommand(`ping -n 1 ${ip}`)
        const match = command.stdOut.match(/time[=<](\d+)ms/)
        const pingValue = match ? match[1] + "ms" : "N/A"


        const el = document.getElementById(`ping-${serverID}`)
        // el.classList.remove("bg-succsess" , "bg-warning", "bg-danger", "bg-secondary")
        if (el) {
            const rawMs = parseInt(match[1])
            el.textContent = rawMs + 'ms'
            if(rawMs < 100){
                el.classList.add("bg-success")
            }else{
                el.classList.add("bg-warning")
            }
        }
    }
    catch (e) {
        el.textContent = "ping faild"
        el.classList.add("bg-danger")
        console.error("ping faild for " + addr, e)
    }

}
function renderNextBatch() {
    const serverList = document.getElementById('servers');


    const batch = allServers.slice(currentIndex, currentIndex + batchSize);

    batch.forEach(server => {
        const serverID = server.addr.replace(/[:.]/g, '-')
        const html = `
            
              <b class="text-center">[${server.map}] ${server.name} | Players: ${server.players}/${server.max_players}</b>
                <div class="badge" id="ping-${serverID}"></div>
                </div>
                <button class="btnConnect p-2 fw-bold" onclick="connect('${server.addr}')">connect</button>
                <hr>


            `;
        serverList.insertAdjacentHTML('beforeend', html);
        updateServerPing(server.addr , serverID)
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