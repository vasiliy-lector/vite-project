export type RemoteSettings = {
  requests: number;
  lastUpdate: string;
};

export function fetchRemoteSettings(): Promise<RemoteSettings> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ requests: 42, lastUpdate: '2026-08-29' });
    }, 300);
  });
}
