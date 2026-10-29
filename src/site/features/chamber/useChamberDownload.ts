import { useEffect, useState } from 'react';
import { CHAMBER_DOWNLOAD, CHAMBER_DOWNLOAD_WINDOWS } from '@/site/features/chamber/links';

/** Chamber's two apps: what a Download button says and where it goes, and the line under it. */
const DOWNLOADS = {
  mac: { href: CHAMBER_DOWNLOAD, label: 'Download for Mac', name: 'Mac', note: 'Free for macOS 13 or later on Apple silicon.' },
  windows: { href: CHAMBER_DOWNLOAD_WINDOWS, label: 'Download for Windows', name: 'Windows', note: 'Free for Windows 10 or 11.' },
} as const;

type Platform = keyof typeof DOWNLOADS;

function visitorPlatform(): Platform {
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  return /win/i.test(nav.userAgentData?.platform || nav.platform || nav.userAgent) ? 'windows' : 'mac';
}

/**
 * The download for the visitor's computer, and the other one. Mac until the browser says otherwise
 * (the first render, and anything that isn't Windows), so a Windows visitor gets the installer.
 */
export function useChamberDownload() {
  const [platform, setPlatform] = useState<Platform>('mac');
  useEffect(() => setPlatform(visitorPlatform()), []);
  return { primary: DOWNLOADS[platform], other: DOWNLOADS[platform === 'mac' ? 'windows' : 'mac'] };
}
