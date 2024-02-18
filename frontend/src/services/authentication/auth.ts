import {invoke} from '@tauri-apps/api/core';
import * as platform from 'platform';
import {type NavigateFunction} from 'react-router-dom';
import {type AvailError, AvailErrorType} from '../../types/errors';
import {type CreateSessionResponse, type VerifySessionRequest} from '../../types/auth';

// TODO - Put as fallback to session auth failure for desktop (might be a network issue)
// platform can be removed -> migrate to cfg only
export function local_auth(password: string | undefined, navigate: NavigateFunction) {
	if (platform.os?.family === 'Android') {
		invoke<string>('android_auth', {password, key_type: 'avl-v'}).then(r => {
			navigate('/home');
		}).catch((error: AvailError) => {
			console.log('Error');
			console.log(error.internal_msg);
			if (error.external_msg === 'Login') {
				navigate('/login');
			} else {
				console.log('Error');
				console.log(error.internal_msg);
				navigate('/register');
			}
		});
	} else {
		invoke('ios_auth', {password, key_type: 'avl-v'}).then(r => {
			navigate('/home');
		}).catch((error: AvailError) => {
			if (error.external_msg === 'Login') {
				navigate('/login');
			} else {
				navigate('/register');
			}
		});
	}
}

export async function session_and_local_auth(password: string | undefined, navigate: NavigateFunction, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, entrypoint: boolean) {
	const res = invoke<string>('get_session', {password});
	return res;
}

{/* -- For Android (JNI Async failure fix) --*/}
export function get_hash(password: string | undefined, navigate: NavigateFunction, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, entrypoint: boolean) {
	invoke<CreateSessionResponse>('request_hash').then(res => {
		get_signature(res, password, navigate, setAlert, setMessage, entrypoint);
	}).catch((error: AvailError) => {
		if (entrypoint) {
			navigate('/register');
		}

		setMessage('Failed to authenticate, please try again.');
		setAlert(true);
	});
}

export function get_signature(request: CreateSessionResponse, password: string | undefined, navigate: NavigateFunction, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, entrypoint: boolean) {
	invoke<VerifySessionRequest>('sign_hash', {request, password}).then(res => {
		session(res, navigate, setAlert, setMessage, entrypoint);
	}).catch((error: AvailError) => {
		if (error.external_msg === 'Login') {
			navigate('/login');
		} else {
			if (entrypoint) {
				console.log('Error');
				console.log(error.internal_msg);
				navigate('/register');
			}

			setMessage('Failed to authenticate, please try again.');
			setAlert(true);
		}
	});
}

export function session(request: VerifySessionRequest, navigate: NavigateFunction, setAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, entrypoint: boolean) {
	invoke<string>('get_session_only', {request}).then(session_id => {
		console.log(session_id);
		sessionStorage.setItem('session_id', session_id);
		navigate('/home');
	}).catch((error: AvailError) => {
		if (entrypoint) {
			navigate('/register');
		}

		setMessage('Failed to authenticate, please try again.');
		setAlert(true);
	});
}

// TODO - Fix Delete
export function delete_util(setSuccessAlert: React.Dispatch<React.SetStateAction<boolean>>, setErrorAlert: React.Dispatch<React.SetStateAction<boolean>>, setMessage: React.Dispatch<React.SetStateAction<string>>, navigate: NavigateFunction, password: string | undefined) {
	invoke('delete_util', {password}).then(r => {
		setMessage('Account deleted successfully.');
		setSuccessAlert(true);

		navigate('/register');
	}).catch(error_ => {
		const error = JSON.parse(error_) as AvailError;
		console.log(error);
		if (error.error_type === AvailErrorType.Unauthorized) {
			setMessage(error.external_msg);
			setErrorAlert(true);
		}

		if (error.external_msg === 'Invalid Circuit') {
			setMessage('Wrong password, please try again.');
			setErrorAlert(true);
		} else {
			setMessage('Failed to delete account, please try again.');
			setErrorAlert(true);
		}
	});
}
