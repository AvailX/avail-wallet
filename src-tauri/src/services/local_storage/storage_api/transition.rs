use snarkvm::prelude::{Address, Network};

use crate::models::pointers::transition::TransitionPointer;
use crate::services::local_storage::{
    encrypted_data::{get_encrypted_data_by_flavour, store_encrypted_data},
    session::view::VIEWSESSION,
};

use avail_common::{
    errors::AvailResult,
    models::encrypted_data::{EncryptedData, EncryptedDataTypeCommon},
};

/* -- Transitions -- */

pub fn get_transitions<N: Network>() -> AvailResult<Vec<TransitionPointer<N>>> {
    let encrypted_transitions = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Transition)?;

    decrypt_transitions(encrypted_transitions)
}

//TODO - Test how long this takes with multiple transactions to decrypt
pub fn get_transition_ids<N: Network>() -> AvailResult<Vec<String>> {
    let transitions = get_transitions::<N>()?;

    // TODO - Get transitions from transition_pointers, TransactionPointer and TransactionMessage
    let tx_ids = transitions
        .iter()
        .map(|transition| transition.id.to_string())
        .collect::<Vec<String>>();

    Ok(tx_ids)
}

pub fn decrypt_transitions<N: Network>(
    encrypted_transitions: Vec<EncryptedData>,
) -> AvailResult<Vec<TransitionPointer<N>>> {
    let v_key = VIEWSESSION.get_instance::<N>()?;

    let transitions = encrypted_transitions
        .iter()
        .map(|x| {
            let encrypted_data = x.to_enrypted_struct::<N>()?;

            let tx_in: TransitionPointer<N> = encrypted_data.decrypt(v_key)?;

            Ok(tx_in)
        })
        .collect::<AvailResult<Vec<TransitionPointer<N>>>>()?;

    Ok(transitions)
}

fn encrypt_and_store_transitions<N: Network>(
    transitions: Vec<TransitionPointer<N>>,
    address: Address<N>,
) -> AvailResult<Vec<EncryptedData>> {
    let encrypted_transitions = transitions
        .iter()
        .map(|transition| {
            let encrypted_data = transition.to_encrypted_data(address)?;

            store_encrypted_data(encrypted_data.clone())?;

            Ok(encrypted_data)
        })
        .collect::<AvailResult<Vec<EncryptedData>>>()?;

    Ok(encrypted_transitions)
}

#[cfg(test)]
mod transitions_storage_api_tests {
    use super::*;
    use snarkvm::{
        prelude::{Field, Group, Identifier, Input, Output, ProgramID, Testnet3, Transition},
        utilities::{TestRng, Uniform},
    };
    use std::str::FromStr;

    #[test]
    fn test_get_transitions() {
        let transitions = get_transitions::<Testnet3>().unwrap();

        print!("Transitions \n {:?}", transitions)
    }
    #[test]
    fn test_get_transitions_ids() {
        let transition_ids = get_transition_ids::<Testnet3>().unwrap();

        print!("Transition IDs \n {:?}", transition_ids)
    }

    fn initialise_test_transition() -> Transition<Testnet3> {
        let mut rng = TestRng::default();

        let field = Field::<Testnet3>::new(Uniform::rand(&mut rng));
        let program_identifier = Identifier::<Testnet3>::from_str("test_program_id").unwrap();
        let domain_identifier = Identifier::<Testnet3>::from_str("aleo").unwrap();

        let program_id =
            ProgramID::<Testnet3>::try_from((program_identifier, domain_identifier)).unwrap();

        let function_name = Identifier::<Testnet3>::from_str("test").unwrap();

        let input = Input::<Testnet3>::Constant(field, None);
        let output = Output::<Testnet3>::Constant(field, None);

        let tpk = Group::<Testnet3>::new(Uniform::rand(&mut rng));
        let tcm = Field::<Testnet3>::new(Uniform::rand(&mut rng));
        let transition = Transition::<Testnet3>::new(
            program_id,
            function_name,
            vec![input],
            vec![output],
            tpk,
            tcm,
        )
        .unwrap();

        transition
    }
}
