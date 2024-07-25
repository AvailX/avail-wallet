import {invoke} from '@tauri-apps/api/core';

import {type Campaign, type Quest, type WhitelistResponse, type PointsResponse, type Collection} from '../../types/quests/quest_types';

export async function getCampaigns() {
	return invoke<Campaign[]>('get_campaigns');
}

export async function getQuests(campaignId: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<Quest[]>('get_quests_for_campaign', {campaign_id: campaignId});
}

export async function isQuestCompleted(questId: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<boolean>('check_quest_completion', {quest_id: questId});
}

export async function isTaskCompleted(taskId: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<boolean>('is_task_verified', {task_id: taskId});
}

// eslint-disable-next-line max-params
export async function verifyTask(taskId: string, startTime: Date, endTime: Date, programId: string, functionId: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<boolean>('verify_task', {start_time: startTime, end_time: endTime, task_id: taskId, program_id: programId, function_id: functionId});
}

export async function getPoints() {
	return invoke<PointsResponse[]>('get_points');
}

export async function getWhitelists() {
	return invoke<WhitelistResponse[]>('get_whitelists');
}

export async function getCollections() {
	return invoke<Collection[]>('get_collections');
}
