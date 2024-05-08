import {invoke} from '@tauri-apps/api/core';

export async function initDappPrivacySettings() {
    const res: string = await invoke('init_dapp_privacy_settings');

    return res;
}

export async function createDappPrivacySetting(url: string, trusted: boolean) {
    const res: string = await invoke('create_dapp_privacy_settings', {url, trusted});

    return res;
}

export async function readDappPrivacySettings(url: string) {
    const res: string = await invoke('read_dapp_privacy_settings', {url});

    return res;
}

export async function updateDappPrivacySettings(url: string, trusted: boolean) {
    const res: string = await invoke('update_dapp_privacy_settings', {url, trusted});

    return res;
}

export async function dropDappPrivacySettings(url: string) {
    const res: string = await invoke('drop_dapp_privacy_settings', {url});

    return res;
}