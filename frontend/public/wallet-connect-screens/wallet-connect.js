const { emit, listen } = window.__TAURI__.event;

let request;
let feeOption = false; // State for the fee option


// listen for requests
const unlisten = listen('wallet-connect-request', (data) => {
    console.log('wallet-connect-request', data);
    request = data.payload;
    updateUIswitchCase(data.payload);
});

// event listener for the fee switch
document.getElementById('fee-switch').addEventListener('change', (event) => {
    feeOption = event.target.checked;
    console.log('Fee option:', feeOption ? 'Private' : 'Public');
  });


document.querySelector('.btn.approve').addEventListener('click', async () => {
    const eventName = request.method + '-approved';
    console.log(eventName);
    if (request.method === 'create-request-event') {
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
    await emit(eventName, { message: request.rejectResponse });
    console.log('reject clicked');
    
    window.close(); 
   
});

function updateUIswitchCase(data){
  document.getElementById('loadingIndicator').style.display = 'none';
  document.getElementById('loadingDiv').style.display = 'none';
  // update pending requests

  document.getElementById('pendingCounter').style.display = 'none';
  document.body.style.justifyContent= 'space-between';

  // remove none 
  document.getElementById('dapp').style.display = 'flex';
  document.getElementById('button-row').style.display = 'flex';
  document.getElementById('img_src').style.display = 'block';
  document.getElementById('question').innerText = data.question;
  document.getElementById('question').style.marginTop = '12px';
  document.getElementById('img_src').src = data.dapp_img;
  document.getElementById('url').innerText = data.dapp_url;
  document.getElementById('scrollable-container').style.display = 'flex';

    switch (data.method) {
        case 'connect':
          break;
        case 'sign':
          document.getElementById('message').style.display = 'block';
          document.getElementById('message-input').style.display = 'block';
          document.getElementById('message-input').innerText = data.message;
          break;
        case 'decrypt':
          document.getElementById('ciphertext').style.display = 'block';
          displayCiphertexts(data.ciphertexts);
          break;
        case 'create-request-event':
          if(data.program_id){
            document.getElementById('program').style.display = 'block';
            document.getElementById('program-input').style.display = 'block';
            document.getElementById('program-input').innerText = data.program_id;
          }
          if (data.function_id){
            document.getElementById('function_id').style.display = 'block';
            document.getElementById('function-input').style.display = 'block';
            document.getElementById('function-input').innerText = data.function_id;
          }
          document.getElementById('fee').style.display = 'block';
          document.getElementById('fee-input').style.display = 'block';
          document.getElementById('fee-input').innerText = data.fee;
          document.getElementById('fee-option').style.display = 'block';
         
          displayInputs(data.inputs);
          break;
        case 'get-events':
          document.getElementById('events_filter').style.display = 'block';
          if(data.program_id){
            document.getElementById('program').style.display = 'block';
            document.getElementById('program-input').style.display = 'block';
            document.getElementById('program-input').innerText = data.program_id;
          }
          if (data.function_id){
            document.getElementById('function_id').style.display = 'block';
            document.getElementById('function-input').style.display = 'block';
            document.getElementById('function-input').innerText = data.function_id;
          }
          if (data.type){
            document.getElementById('type').style.display = 'block';
            document.getElementById('type-input').style.display = 'block';
            document.getElementById('type-input').innerText = data.type;
          }
          break;
        case 'get-event':
          break;
        case 'get-records':
          document.getElementById('records_filter').style.display = 'block';
          if(data.program_ids){
            displayProgramIds(data.program_ids);
          }
          if (data.function_id){
            document.getElementById('function_id').style.display = 'block';
            document.getElementById('function-input').style.display = 'block';
            document.getElementById('function-input').innerText = data.function_id;
          }
          if (data.type){
            document.getElementById('type').style.display = 'block';
            document.getElementById('type-input').style.display = 'block';
            document.getElementById('type-input').innerText = data.type;
          }
          break;
        case 'balance':
          document.getElementById('asset_id').style.display = 'block';
          document.getElementById('asset-input').style.display = 'block';
          document.getElementById('asset-input').innerText = data.asset_id;
          break;
        default:
          break;
    }
}

function displayInputs(inputs) {
  document.getElementById('inputs').style.display = 'block';
 
  const inputsContainer = document.getElementById('inputs-container');
  // Clear previous inputs
  inputsContainer.innerHTML = '';
  if (Array.isArray(inputs)) {
    console.log('array check worked');
      inputs.forEach(input => {
        console.log("creating input divs")
          const inputDiv = document.createElement('div');
          inputDiv.className = 'field';
          inputDiv.textContent = input; // If input is not just text, you'll need to handle it accordingly
          inputDiv.style.display = 'block'
          inputsContainer.appendChild(inputDiv);
      });
  }
  inputsContainer.style.display = 'block';
}

function displayProgramIds(programs) {
  document.getElementById('programs').style.display = 'block';
  
  const programsContainer = document.getElementById('programs-container');
  // Clear previous inputs
  programsContainer.innerHTML = '';
  if (Array.isArray(programs)) {
    console.log('array check worked', programs);
      programs.forEach(input => {
          const inputDiv = document.createElement('div');
          inputDiv.className = 'field';
          inputDiv.textContent = input; // If input is not just text, you'll need to handle it accordingly
          inputDiv.style.display = 'block'
          programsContainer.appendChild(inputDiv);
      });
  }
  programsContainer.style.display = 'block';
}

function displayCiphertexts(ciphertexts) {
  const ciphertextsContainer = document.getElementById('ciphertexts-container');
  // Clear previous ciphertexts
  ciphertextsContainer.innerHTML = '';
  if (Array.isArray(ciphertexts)) {
      ciphertexts.forEach(ciphertext => {
          const ciphertextDiv = document.createElement('div');
          ciphertextDiv.className = 'field';
          ciphertextDiv.textContent = ciphertext; // Assuming ciphertext is text
          ciphertextDiv.style.display = 'block';
          ciphertextsContainer.appendChild(ciphertextDiv);
      });
  }
  ciphertextsContainer.style.display = 'block';
}
