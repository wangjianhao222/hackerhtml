const terminal = document.getElementById('terminal');
const promptInput = document.getElementById('prompt-input');
const logBox = document.getElementById('log-box');

const commands = {
    nmap: [
        "Executing Nmap Scan...",
        "nmap -sV -T4 -p- 192.168.1.101",
        "Starting Nmap 7.91 ( https://nmap.org ) at " + new Date().toTimeString(),
        "Nmap scan report for target.local (192.168.1.101)",
        "Host is up (0.0021s latency).",
        "Not shown: 996 closed ports",
        "PORT      STATE SERVICE      VERSION",
        "22/tcp    open  ssh          OpenSSH 8.2p1",
        "80/tcp    open  http         Apache httpd 2.4.41",
        "443/tcp   open  ssl/http     Nginx 1.18.0",
        "3306/tcp  open  mysql        MySQL 8.0.22",
        "Scan Complete. Found 4 open ports.",
    ],
    metasploit: [
        "Initializing Metasploit Framework...",
        "msf6 > use exploit/multi/handler",
        "msf6 exploit(multi/handler) > set payload windows/meterpreter/reverse_tcp",
        "payload => windows/meterpreter/reverse_tcp",
        "msf6 exploit(multi/handler) > set LHOST 10.10.14.2",
        "LHOST => 10.10.14.2",
        "msf6 exploit(multi/handler) > exploit -j",
        "[*] Exploit running as background job 0.",
        "[*] Started reverse TCP handler on 10.10.14.2:4444",
        "[*] Sending stage (179779 bytes) to 192.168.1.101",
        "[*] Meterpreter session 1 opened (10.10.14.2:4444 -> 192.168.1.101:49234)",
        "Session established. Access granted."
    ],
    wireshark: [
        "Starting packet capture on eth0...",
        "Filter applied: tcp port 443",
        "Capturing handshake... [SYN]",
        "Capturing handshake... [SYN, ACK]",
        "Handshake complete. TLSv1.3 session established.",
        "Decrypting traffic with pre-shared key...",
        "--- PACKET DATA ---",
        "POST /api/login HTTP/1.1",
        "Host: confidential.corp",
        "Authorization: Bearer [REDACTED]",
        "User-Agent: Mozilla/5.0",
        "Data: { 'user': 'admin', 'pass': 'p@ssw0rd123!' }",
        "Credentials captured.",
    ],
    aircrack: [
        "Executing Aircrack-ng suite...",
        "airodump-ng wlan0mon",
        "CH 11 ][ Elapsed: 5 s ][ 2023-10-27 10:10",
        "BSSID              PWR  Beacons    #Data, #/s  CH  MB   ENC  CIPHER AUTH ESSID",
        "00:14:6C:7E:40:80  -32       10        8     1   11  54e  WPA2 CCMP   PSK  CorpWifi",
        "Capturing handshake for CorpWifi...",
        "WPA handshake: 00:14:6C:7E:40:80",
        "Handshake captured. Starting dictionary attack...",
        "aircrack-ng -w /usr/share/wordlists/rockyou.txt -b 00:14:6C:7E:40:80 capture.cap",
        "KEY FOUND! [ 12345678 ]",
    ],
    hashcat: [
        "Initializing Hashcat v6.2.5...",
        "hashcat -m 0 -a 0 hashes.txt /usr/share/wordlists/rockyou.txt",
        "Session..........: hashcat",
        "Status...........: Running",
        "Hash.Type........: MD5",
        "Hash.Target......: hashes.txt",
        "Guess.Base.......: File (/usr/share/wordlists/rockyou.txt)",
        "Speed.#1.........: 1573.0 MH/s",
        "Recovered........: 1/1 (100.00%) Digests",
        "Progress.........: 98.76%",
        "e10adc3949ba59abbe56e057f20f883e:123456",
        "All hashes cracked.",
    ],
    sqlmap: [
        "Starting SQLmap...",
        "sqlmap -u 'http://testphp.vulnweb.com/listproducts.php?cat=1' --dbs --batch",
        "retrieved: information_schema",
        "retrieved: mysql",
        "retrieved: performance_schema",
        "retrieved: acuart",
        "available databases [4]:",
        "[*] acuart",
        "[*] information_schema",
        "[*] mysql",
        "[*] performance_schema",
        "sqlmap -D acuart -T users --dump",
        "Database: acuart",
        "Table: users",
        "[3 entries]",
        "+----+----------+------------------+",
        "| id | name     | pass             |",
        "+----+----------+------------------+",
        "| 1  | testuser | testpass         |",
        "| 2  | admin    | admin123         |",
        "| 3  | guest    | guest            |",
        "+----+----------+------------------+",
        "Table 'acuart.users' dumped.",
    ],
     john: [
        "Executing John the Ripper...",
        "john --wordlist=/usr/share/wordlists/fasttrack.txt /etc/shadow",
        "Loaded 3 password hashes with 3 different salts (crypt, generic Unix)",
        "Press 'q' or Ctrl-C to abort, almost any other key for status",
        "admin123         (root)",
        "password         (user)",
        "12345            (guest)",
        "3g 0:00:00:02 DONE 3/3 (2023-10-27 11:00)",
        "Session complete.",
    ],
     hydra: [
        "Executing Hydra...",
        "hydra -L users.txt -P passwords.txt ftp://192.168.0.1",
        "Hydra v9.1 (c) 2020 by van Hauser/THC",
        "Hydra starting at 2023-10-27 11:15:04",
        "[DATA] max 16 tasks per 1 server, overall 16 tasks...",
        "[STATUS] 150000 tries/min, 150000 tries in 00:01 min, 300000 to do",
        "[21][ftp] host: 192.168.0.1 login: admin password: password123",
        "1 of 1 target successfully completed, 1 valid password found",
        "Hydra finished.",
    ],
};

let isTyping = false;

function type(text, target, callback) {
    let i = 0;
    const interval = setInterval(() => {
        target.innerHTML += text.charAt(i);
        i++;
        if (i > text.length) {
            clearInterval(interval);
            if (callback) callback();
        }
    }, 20);
}

function typeLine(line, target, callback) {
    const div = document.createElement('div');
    target.appendChild(div);
    type(line, div, () => {
        terminal.scrollTop = terminal.scrollHeight;
        if (callback) callback();
    });
}

function runCommand(cmd) {
    if (isTyping) return;
    isTyping = true;

    promptInput.textContent = cmd;

    setTimeout(() => {
        const outputDiv = document.createElement('div');
        outputDiv.innerHTML = `<span>root@ghost:~#</span><span>${cmd}</span>`;
        terminal.appendChild(outputDiv);
        promptInput.textContent = '';

        const lines = commands[cmd] || ["Command not found."];
        let lineIndex = 0;

        function nextLine() {
            if (lineIndex < lines.length) {
                typeLine(lines[lineIndex], terminal, nextLine);
                lineIndex++;
            } else {
                isTyping = false;
            }
        }
        nextLine();
    }, 500);
}

document.querySelectorAll('.tool-button').forEach(button => {
    button.addEventListener('click', () => {
        const cmd = button.getAttribute('data-cmd');
        runCommand(cmd);
    });
});

// Vitals simulation
setInterval(() => {
    const cpu = Math.random() * 100;
    const mem = Math.random() * 100;
    const netDown = Math.random() * 5000;
    const netUp = Math.random() * 500;

    document.getElementById('cpu-val').textContent = `${cpu.toFixed(2)}%`;
    document.getElementById('cpu-bar').style.width = `${cpu}%`;
    document.getElementById('mem-val').textContent = `${mem.toFixed(2)}%`;
    document.getElementById('mem-bar').style.width = `${mem}%`;
    document.getElementById('net-down-val').textContent = `${netDown.toFixed(2)} KB/s`;
    document.getElementById('net-down-bar').style.width = `${(netDown / 5000) * 100}%`;
    document.getElementById('net-up-val').textContent = `${netUp.toFixed(2)} KB/s`;
    document.getElementById('net-up-bar').style.width = `${(netUp / 500) * 100}%`;
}, 1500);

// Log feed simulation
const logMessages = [
    { type: 'success', text: 'Quantum encryption layer synced.'},
    { type: 'info', text: 'Routing traffic through TOR node matrix...'},
    { type: 'info', text: 'Probing firewall on 103.22.14.88:443'},
    { type: 'warn', text: 'Firewall port 80 seems closed. Trying alternative...'},
    { type: 'success', text: 'Bypassed firewall using CVE-2021-44228.'},
    { type: 'info', text: 'Injecting payload...'},
    { type: 'error', text: 'Connection to target unstable. Re-routing...'},
    { type: 'success', text: 'Root access gained on host: SRV-FINANCE-01.'},
    { type: 'info', text: 'Scraping user credentials from memory...'},
    { type: 'warn', text: 'Honeypot detected. Evading...'},
    { type: 'info', text: 'Cleaning tracks... Deleting logs...'},
];

setInterval(() => {
    const msg = logMessages[Math.floor(Math.random() * logMessages.length)];
    const logEntry = document.createElement('div');
    logEntry.className = `log-entry ${msg.type}`;
    logEntry.textContent = `[${new Date().toLocaleTimeString()}] ${msg.text}`;
    logBox.appendChild(logEntry);
    logBox.scrollTop = logBox.scrollHeight;
    if(logBox.children.length > 50) {
        logBox.removeChild(logBox.firstChild);
    }
}, 2000);

// Initial welcome message
const welcomeMessage = [
    "Connecting to G.H.O.S.T. network...",
    "Connection established.",
    "Authenticating user...",
    "Authentication successful. Welcome, Operator.",
    "Loading modules... All systems operational.",
    "Awaiting your command."
];

let welcomeIndex = 0;
isTyping = true;
function showWelcome() {
    if (welcomeIndex < welcomeMessage.length) {
        typeLine(welcomeMessage[welcomeIndex], terminal, showWelcome);
        welcomeIndex++;
    } else {
        isTyping = false;
    }
}
showWelcome();