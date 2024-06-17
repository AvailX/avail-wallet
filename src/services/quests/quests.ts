import {invoke} from '@tauri-apps/api/core';

import {type Campaign, type Quest, type WhitelistResponse, type PointsResponse, type Collection} from '../../types/quests/quest_types';

export async function getCampaigns() {
	return invoke<Campaign[]>('get_campaigns');
}

export async function createCampaign(
	title: string,
    subtitle: string,
    desc_1: string,
    desc_main: string,
    desc_2: string,
    inner_desc: string,
    box_image: string,
    bg_image: string,
    profile_image: string,
    color: string,
    points_image: string,
    project_name: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<Campaign>('create_campaign', {title, subtitle, desc_1, desc_main, desc_2, inner_desc, box_image, bg_image, profile_image, color, points_image, project_name});
}

export async function updateCampaign(
	campaignId: string,
	title: string,
	subtitle: string,
	desc_1: string,
	desc_main: string,
	desc_2: string,
	inner_desc: string,
	box_image: string,
	bg_image: string,
	profile_image: string,
	color: string,
	points_image: string,
	project_name: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<Campaign>('update_campaign', {campaign_id: campaignId, title, subtitle, desc_1, desc_main, desc_2, inner_desc, box_image, bg_image, profile_image, color, points_image, project_name});
}

export async function deleteCampaign(campaignId: string) {
	// eslint-disable-next-line @typescript-eslint/naming-convention
	return invoke<boolean>('delete_campaign', {campaign_id: campaignId});
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
