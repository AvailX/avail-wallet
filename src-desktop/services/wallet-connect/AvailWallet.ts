/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { invoke } from "@tauri-apps/api/core";
import { once, type Event, emit } from "@tauri-apps/api/event";
import { type WebviewOptions } from "@tauri-apps/api/webview";
import { getAll, WebviewWindow } from "@tauri-apps/api/webviewWindow";
import { type Window, type WindowOptions } from "@tauri-apps/api/window";
import {
  formatJsonRpcError,
  formatJsonRpcResult,
  type JsonRpcError,
  type JsonRpcResult,
} from "@walletconnect/jsonrpc-utils";
import { type Web3WalletTypes } from "@walletconnect/web3wallet";
import { type AvailError } from "../../types/errors";

function checkWindow(reference: string) {
  return getAll().some((win) => win.label === reference);
}
/**
 * Get the window object from the window list
 * @param windowLabel - The window label
 * @returns The WebviewWindow object
 */
function getWindow(windowLabel: string): WebviewWindow | undefined {
	return getAll().find(win => win.label === windowLabel);
}
/**
 * Get the window object from the window list or create a new one if it doesn't exist
 * @param windowLabel - The window label
 * @param options - The window options
 * @returns The WebviewWindow object
 */
function getWindowOrCreate(
	windowLabel: string,
	options?: Omit<WebviewOptions, 'x' | 'y' | 'width' | 'height'> &
	WindowOptions,
): WebviewWindow {
	const window = getWindow(windowLabel);
	if (window) {
		return window;
	}

	return new WebviewWindow(windowLabel, options);
}
/**
 * Emit an event after a number of seconds
 * @param window The tauri webview window
 * @param event The label of the event to emit
 * @param payload The payload to emit
 * @param seconds The number of seconds to wait before emitting the event
 */
function emitAfterSeconds(
	window: WebviewWindow,
	event: string,
	payload: any,
	seconds: number,
) {
	setTimeout(async () => {
		await window.emit(event, payload);
	}, seconds * 1000);
}
/**
 * Get the DApp session metadata from the session storage
 * @param session_topic The wallet connect session topic
 * @returns The DApp session metadata
 */

//cahnge the dapp section to response to Aleo
function getDappMetadata(session_topic: string): DAppSession | undefined {
	const dappSessionString = sessionStorage.getItem(session_topic);

	if (dappSessionString) {
		const dappSession: DAppSession = JSON.parse(
			dappSessionString,
		) as DAppSession;
		return dappSession;
	}
}
