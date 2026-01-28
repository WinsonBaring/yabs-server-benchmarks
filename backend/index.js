const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

// Get all benchmarks
app.get('/api/benchmarks', (req, res) => {
    const benchmarks = db.prepare('SELECT id, server_name, timestamp, provider, location, cpu_model FROM benchmarks ORDER BY timestamp DESC').all();
    res.json(benchmarks);
});

// Get single benchmark
app.get('/api/benchmarks/:id', (req, res) => {
    const benchmark = db.prepare('SELECT * FROM benchmarks WHERE id = ?').get(req.params.id);
    if (benchmark) {
        benchmark.raw_data = JSON.parse(benchmark.raw_data);
        res.json(benchmark);
    } else {
        res.status(404).json({ error: 'Benchmark not found' });
    }
});

// Add new benchmark
app.post('/api/benchmarks', (req, res) => {
    try {
        const { data, overrides } = req.body;

        // Support two modes: 
        // 1. Just raw data (legacy/simple)
        // 2. { data: {...}, overrides: {...} } (new/robust)
        const rawData = data || req.body;
        const ovr = overrides || {};

        // Extract search-friendly fields with fallbacks and overrides
        const serverName = ovr.server_name || rawData?.server_name || 'Unknown Server';
        const provider = ovr.provider || rawData?.os?.provider || 'Unknown';
        const location = ovr.location || rawData?.os?.location || 'Unknown';
        const cpuModel = ovr.cpu_model || rawData?.cpu?.model || 'Unknown';
        const cpuCores = ovr.cpu_cores || rawData?.cpu?.cores || 0;
        const cpuFreq = ovr.cpu_freq || rawData?.cpu?.speed || 'Unknown';
        const ramTotal = ovr.ram_total || rawData?.mem?.ram_total || 'Unknown';

        const stmt = db.prepare(`
      INSERT INTO benchmarks (server_name, provider, location, cpu_model, cpu_cores, cpu_freq, ram_total, raw_data)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);

        const result = stmt.run(
            serverName,
            provider,
            location,
            cpuModel,
            cpuCores,
            cpuFreq,
            ramTotal,
            JSON.stringify(rawData)
        );

        res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
        console.error('Save error:', error);
        res.status(500).json({ error: 'Failed to save benchmark: ' + error.message });
    }
});

app.listen(port, () => {
    console.log(`Backend listening at http://localhost:${port}`);
});
