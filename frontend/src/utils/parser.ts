export const parseYabsText = (text: string) => {
    const result: any = {
        os: {},
        cpu: {},
        mem: {},
        disk: {},
        network: [],
        geekbench: {}
    };

    const getMatch = (regex: RegExp) => {
        const m = text.match(regex);
        return m ? m[1].trim() : '';
    };

    // 1. Basic System Info
    result.os.provider = getMatch(/ISP\s+:\s+(.*)/);
    result.os.location = getMatch(/Location\s+:\s+(.*)/);
    result.os.distro = getMatch(/Distro\s+:\s+(.*)/);

    // 2. CPU Info (Using Processor label from sample)
    result.cpu.model = getMatch(/Processor\s+:\s+(.*)/) || getMatch(/Model\s+:\s+(.*)/);
    result.cpu.cores = getMatch(/CPU cores\s+:\s+(.*)/) || getMatch(/Cores\s+:\s+(.*)/);
    result.cpu.speed = getMatch(/Speed\s+:\s+(.*)/) || (result.cpu.cores.includes('@') ? result.cpu.cores.split('@')[1].trim() : '');

    // 3. Memory Info
    result.mem.ram_total = getMatch(/RAM\s+:\s+(.*)/);
    result.mem.swap_total = getMatch(/Swap\s+:\s+(.*)/);

    // 4. Disk Speed (fio)
    // Captures all "Total" lines to handle multiple block sizes (4k, 64k, 512k, 1m)
    const diskResults: any[] = [];
    const diskMatches = Array.from(text.matchAll(/Total\s+\|\s+([\d.]+ (?:MB|GB)\/s)\s+\(([\d.]+k?)\)(?:\s+\|\s+([\d.]+ (?:MB|GB)\/s)\s+\(([\d.]+k?)\))?/g));

    // First match often contains 4k and 64k
    if (diskMatches[0]) {
        diskResults.push({ block: '4k', speed: diskMatches[0][1], iops: diskMatches[0][2] });
        if (diskMatches[0][3]) diskResults.push({ block: '64k', speed: diskMatches[0][3], iops: diskMatches[0][4] });
    }
    // Second match often contains 512k and 1m
    if (diskMatches[1]) {
        diskResults.push({ block: '512k', speed: diskMatches[1][1], iops: diskMatches[1][2] });
        if (diskMatches[1][3]) diskResults.push({ block: '1m', speed: diskMatches[1][3], iops: diskMatches[1][4] });
    }

    result.disk.results = diskResults;
    if (diskResults.length > 0) {
        // We'll use the 1m block size (sequential) as the primary "write_speed" for the overview card
        const sequential = diskResults.find(r => r.block === '1m') || diskResults[diskResults.length - 1];
        result.disk.write_speed = sequential.speed;
        result.disk.iops = sequential.iops;
    }

    // 5. iperf3 Network Speed Tests
    const networkLines = text.split('\n');
    let inNetworkSection = false;

    const parseMbps = (val: string) => {
        if (!val) return 0;
        // Matches "1.23 Gbits/sec" or "900 Mbits/sec" or "100 Kbits/sec" or "Speed MB/s"
        const match = val.match(/([\d.]+)\s*(G|M|K)?(?:bits|Bytes)\/sec/i);
        if (!match) return 0;
        const num = parseFloat(match[1]);
        const unit = (match[2] || '').toUpperCase();
        if (unit === 'G') return num * 1000;
        if (unit === 'K') return num / 1000;
        return num;
    };

    networkLines.forEach(line => {
        if (line.includes('iperf3 Network Speed Tests') || line.includes('Network Speed Tests')) {
            inNetworkSection = true;
            return;
        }
        // Match lines like "Provider | Location | Send | Recv | Ping"
        if (inNetworkSection && line.includes('|') && !line.toLowerCase().includes('provider') && !line.includes('---')) {
            const parts = line.split('|').map(p => p.trim());
            if (parts.length >= 4) {
                const recvMbps = parseMbps(parts[3]);
                const sendMbps = parseMbps(parts[2]);
                result.network.push({
                    provider: parts[0],
                    location: parts[1],
                    send: parts[2],
                    recv: parts[3],
                    speed: recvMbps,
                    sendSpeed: sendMbps,
                    ping: parts[4] || ''
                });
            }
        }
        if (inNetworkSection && line.trim() === '' && result.network.length > 0) {
            inNetworkSection = false;
        }
    });

    // 6. Geekbench
    const gbSingle = text.match(/Single Core\s+[:|]\s+(\d+)/);
    const gbMulti = text.match(/Multi Core\s+[:|]\s+(\d+)/);
    if (gbSingle) result.geekbench.single_core = gbSingle[1];
    if (gbMulti) result.geekbench.multi_core = gbMulti[1];

    // Final result aggregation
    result.server_name = result.os.provider || result.os.location || (result.cpu.model ? result.cpu.model.split(' ')[0] : 'New Server');

    return result;
};
