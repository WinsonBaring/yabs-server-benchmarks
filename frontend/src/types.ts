export interface Benchmark {
    id: string;
    server_name: string;
    timestamp: string;
    provider: string;
    location: string;
    distro: string;
    cpu_model: string;
    cpu_cores: string;
    ram_total: string;
    write_speed: string;
    geekbench_single: string;
    geekbench_multi: string;
    raw_data: any;
}

export interface SimResult {
    time: string;
    rating: string;
    desc: string;
}
