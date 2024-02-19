const {emit, listen} = window.__TAURI__.event;

let request;
let feeOption = false; // State for the fee option

// listen for requests
const unlisten = listen('wallet-connect-request', data => {
	console.log('wallet-connect-request', data);
	request = data.payload;
	updateUIswitchCase(data.payload);
});

// Event listener for the fee switch
document.querySelector('#fee-switch').addEventListener('change', event => {
	feeOption = event.target.checked;
	console.log('Fee option:', feeOption ? 'Private' : 'Public');
});

document.querySelector('.btn.approve').addEventListener('click', async () => {
    const eventName = request.method + '-approved';
    console.log(eventName);
    if (request.method === 'create-request-event') {
        console.log('emitting!')
        await emit(eventName, { message: request.approveResponse, feeOption: feeOption });
    }else{
    await emit(eventName, { message: request.approveResponse });
    }

    window.close();
    console.log('approve clicked');
});

document.querySelector('.btn.reject').addEventListener('click', async () => {
	const eventName = request.method + '-rejected';
	console.log(eventName);
	await emit(eventName, {message: request.rejectResponse});
	console.log('reject clicked');

	window.close();
});

function updateUIswitchCase(data) {
	document.querySelector('#loadingIndicator').style.display = 'none';
	document.querySelector('#loadingDiv').style.display = 'none';
	// Update pending requests

	document.querySelector('#pendingCounter').style.display = 'none';
	document.body.style.justifyContent = 'space-between';

	// Remove none
	document.querySelector('#dapp').style.display = 'flex';
	document.querySelector('#button-row').style.display = 'flex';
	document.querySelector('#img_src').style.display = 'block';
	document.querySelector('#question').innerText = data.question;
	document.querySelector('#question').style.marginTop = '12px';
	document.querySelector('#img_src').src = data.dapp_img;
	document.querySelector('#url').innerText = data.dapp_url;
	document.querySelector('#scrollable-container').style.display = 'flex';

	switch (data.method) {
		case 'connect': {
			break;
		}

		case 'sign': {
			document.querySelector('#message').style.display = 'block';
			document.querySelector('#message-input').style.display = 'block';
			document.querySelector('#message-input').innerText = data.message;
			break;
		}

		case 'decrypt': {
			document.querySelector('#ciphertext').style.display = 'block';
			displayCiphertexts(data.ciphertexts);
			break;
		}

		case 'create-request-event': {
			if (data.program_id) {
				document.querySelector('#program').style.display = 'block';
				document.querySelector('#program-input').style.display = 'block';
				document.querySelector('#program-input').innerText = data.program_id;
			}

			if (data.function_id) {
				document.querySelector('#function_id').style.display = 'block';
				document.querySelector('#function-input').style.display = 'block';
				document.querySelector('#function-input').innerText = data.function_id;
			}

			document.querySelector('#fee').style.display = 'block';
			document.querySelector('#fee-input').style.display = 'block';
			document.querySelector('#fee-input').innerText = data.fee;
			document.querySelector('#fee-option').style.display = 'block';

			displayInputs(data.inputs);
			break;
		}

		case 'get-events': {
			document.querySelector('#events_filter').style.display = 'block';
			if (data.program_id) {
				document.querySelector('#program').style.display = 'block';
				document.querySelector('#program-input').style.display = 'block';
				document.querySelector('#program-input').innerText = data.program_id;
			}

			if (data.function_id) {
				document.querySelector('#function_id').style.display = 'block';
				document.querySelector('#function-input').style.display = 'block';
				document.querySelector('#function-input').innerText = data.function_id;
			}

			if (data.type) {
				document.querySelector('#type').style.display = 'block';
				document.querySelector('#type-input').style.display = 'block';
				document.querySelector('#type-input').innerText = data.type;
			}

			break;
		}

		case 'get-event': {
			break;
		}

		case 'get-records': {
			document.querySelector('#records_filter').style.display = 'block';
			if (data.program_ids) {
				displayProgramIds(data.program_ids);
			}

			if (data.function_id) {
				document.querySelector('#function_id').style.display = 'block';
				document.querySelector('#function-input').style.display = 'block';
				document.querySelector('#function-input').innerText = data.function_id;
			}

			if (data.type) {
				document.querySelector('#type').style.display = 'block';
				document.querySelector('#type-input').style.display = 'block';
				document.querySelector('#type-input').innerText = data.type;
			}

			break;
		}

		case 'balance': {
			document.querySelector('#asset_id').style.display = 'block';
			document.querySelector('#asset-input').style.display = 'block';
			document.querySelector('#asset-input').innerText = data.asset_id;
			break;
		}

		default: {
			break;
		}
	}
}

function displayInputs(inputs) {
	document.querySelector('#inputs').style.display = 'block';

	const inputsContainer = document.querySelector('#inputs-container');
	// Clear previous inputs
	inputsContainer.innerHTML = '';
	if (Array.isArray(inputs)) {
		console.log('array check worked');
		for (const input of inputs) {
			console.log('creating input divs');
			const inputDiv = document.createElement('div');
			inputDiv.className = 'field';
			inputDiv.textContent = input; // If input is not just text, you'll need to handle it accordingly
			inputDiv.style.display = 'block';
			inputsContainer.append(inputDiv);
		}
	}

	inputsContainer.style.display = 'block';
}

function displayProgramIds(programs) {
	document.querySelector('#programs').style.display = 'block';

	const programsContainer = document.querySelector('#programs-container');
	// Clear previous inputs
	programsContainer.innerHTML = '';
	if (Array.isArray(programs)) {
		console.log('array check worked', programs);
		for (const input of programs) {
			const inputDiv = document.createElement('div');
			inputDiv.className = 'field';
			inputDiv.textContent = input; // If input is not just text, you'll need to handle it accordingly
			inputDiv.style.display = 'block';
			programsContainer.append(inputDiv);
		}
	}

	programsContainer.style.display = 'block';
}

function displayCiphertexts(ciphertexts) {
	const ciphertextsContainer = document.querySelector('#ciphertexts-container');
	// Clear previous ciphertexts
	ciphertextsContainer.innerHTML = '';
	if (Array.isArray(ciphertexts)) {
		for (const ciphertext of ciphertexts) {
			const ciphertextDiv = document.createElement('div');
			ciphertextDiv.className = 'field';
			ciphertextDiv.textContent = ciphertext; // Assuming ciphertext is text
			ciphertextDiv.style.display = 'block';
			ciphertextsContainer.append(ciphertextDiv);
		}
	}

	ciphertextsContainer.style.display = 'block';
}
