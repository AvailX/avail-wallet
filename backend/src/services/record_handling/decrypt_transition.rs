use std::str::FromStr;

use chrono::{DateTime, Local};
use snarkvm::{
    prelude::{
        Ciphertext, Field, Group, Identifier, Input, Literal, Network, Output, Plaintext,
        ProgramID, ToBits, Transition, ViewKey, U16,
    },
    utilities::Uniform,
};

use super::utils::output_to_record_pointer;
use crate::{
    models::pointers::{
        record::AvailRecord,
        transition::{TransitionPointer, TransitionType},
    },
    models::wallet_connect::records::{GetRecordsRequest, RecordFilterType, RecordsFilter},
    services::local_storage::{
        encrypted_data::store_encrypted_data,
        storage_api::records::{
            get_record_pointers, get_record_pointers_ids, update_record_spent_local,
        },
    },
};
use avail_common::{errors::AvailResult, models::encrypted_data::EncryptedData};

pub struct DecryptTransition {}

impl DecryptTransition {
    // Used to check if the user has executed the transition
    pub fn owns_transition<N: Network>(
        view_key: ViewKey<N>,
        tpk: Group<N>,
        tcm: Field<N>,
    ) -> AvailResult<bool> {
        let scalar = *view_key;
        let tvk = (tpk * scalar).to_x_coordinate();

        //error == "Could not create transition commitment"
        let tcm_derived = N::hash_psd2(&[tvk])?;

        Ok(tcm == tcm_derived)
    }

    // used to check if user owns input or output ciphertext
    // if it is an input
    pub fn decrypt_ciphertext<N: Network>(
        view_key: ViewKey<N>,
        ciphertext_str: &str,
        tpk_str: &str,
        program_id: &str,
        function_name_str: &str,
        index: usize,
    ) -> AvailResult<String> {
        let tpk = Group::<N>::from_str(tpk_str)?;

        //error == "Could not deserialize program_id"
        let program_id = ProgramID::<N>::from_str(program_id)?;

        //error == "Could not deserialize function name"
        let function_name = Identifier::<N>::from_str(function_name_str)?;

        let scalar = *view_key;
        let tvk = (tpk * scalar).to_x_coordinate();

        //error == "Could not create function id"
        let function_id = N::hash_bhp1024(
            &(
                U16::<N>::new(N::ID),
                program_id.name(),
                program_id.network(),
                function_name,
            )
                .to_bits_le(),
        )?;

        let index_field = Field::from_u16(u16::try_from(index)?);

        //error == "Could not create ciphertext view key"
        let ciphertext_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;

        //error == "Could not deserialize ciphertext"
        let ciphertext = Ciphertext::<N>::from_str(ciphertext_str)?;

        //error == "Could not decrypt ciphertext"
        let plaintext = ciphertext.decrypt_symmetric(ciphertext_view_key)?;

        Ok(plaintext.to_string())
    }

    // Checks if the user sent inputs in the transiton or received ouputs from the transition
    pub fn check_inputs_outputs_inclusion<N: Network>(
        view_key: ViewKey<N>,
        transition: Transition<N>,
        transaction_id: N::TransactionID,
        timestamp: DateTime<Local>,
        block_height: u32,
        message: Option<String>,
        from: Option<String>,
    ) -> AvailResult<(Vec<AvailRecord<N>>, Vec<EncryptedData>, Vec<String>)> {
        let address = view_key.to_address();
        let transition_id = transition.id();
        let function_name = transition.function_name().to_string();
        let program_id = transition.program_id().to_string();
        let scalar = *view_key;
        let tvk = (*transition.tpk() * scalar).to_x_coordinate();

        //filter
        let filter = RecordsFilter::new(
            vec![transition.program_id().to_string()],
            None,
            RecordFilterType::Unspent,
            None,
        );
        let get_records_request = GetRecordsRequest::new(None, Some(filter), None);
        let (stored_record_pointers, ids) = get_record_pointers::<N>(get_records_request)?;

        let function_id = N::hash_bhp1024(
            &(
                U16::<N>::new(N::ID),
                transition.program_id().name(),
                transition.program_id().network(),
                transition.function_name(),
            )
                .to_bits_le(),
        )?;

        let mut decrypted_inputs: Vec<Input<N>> = vec![];
        let mut encrypted_input_transition_pointers: Vec<EncryptedData> = vec![];
        let mut spent_input_ids: Vec<String> = vec![];

        let mut decrypted_outputs: Vec<Output<N>> = vec![];
        let mut encrypted_output_transition_pointers: Vec<EncryptedData> = vec![];

        let mut record_pointers: Vec<AvailRecord<N>> = vec![];
        let mut amount = None;

        //check inputs
        for (index, input) in transition.inputs().iter().enumerate() {
            if let Input::Private(id, ciphertext_option) = input {
                if let Some(ciphertext) = ciphertext_option {
                    let index_field = Field::from_u16(u16::try_from(index)?);
                    let input_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;
                    let plaintext = match ciphertext.decrypt_symmetric(input_view_key) {
                        Ok(plaintext) => plaintext,
                        Err(_) => {
                            continue;
                        }
                    };
                    let input = Input::Public(*id, Some(plaintext));
                    decrypted_inputs.push(input.clone());
                } //record inputs are handled later or should be handled directly here to store pointer with it if record was inputted but not executed by user
            } else if let Input::Record(_id, _checksum) = input {
                // spent records should be handled here
                let input_tag = match input.tag() {
                    Some(tag) => tag,
                    None => continue,
                };

                for (record_pointer, id) in stored_record_pointers.iter().zip(ids.iter()) {
                    if &record_pointer.tag()? == input_tag {
                        update_record_spent_local::<N>(id, true)?;
                        spent_input_ids.push(id.to_string());

                        let mock_input =
                            Input::<N>::Public(Uniform::rand(&mut rand::thread_rng()), None);
                        decrypted_inputs.push(mock_input.clone());
                    }
                }
            } else if let Input::Public(_plaintext_hash, Some(plaintext)) = input {
                let plaintext_address = Plaintext::<N>::Literal(
                    Literal::from_str(&address.to_string())?,
                    once_cell::sync::OnceCell::new(),
                );

                if plaintext == &plaintext_address {
                    let rng = &mut rand::thread_rng();

                    amount = find_amount_from_public_transfer(transition.inputs());

                    println!("Amount {:?}", amount);
                    //function is some public transfer to this address thus it is an Output tx
                    let mock_output = Output::<N>::Public(Uniform::rand(rng), None);

                    decrypted_outputs.push(mock_output);
                }
            }
        }

        //check outputs
        let num_inputs = transition.inputs().len();
        for (index, output) in transition.outputs().iter().enumerate() {
            if let Output::Private(id, ciphertext_option) = output {
                if let Some(ciphertext) = ciphertext_option {
                    let index_field = Field::from_u16(u16::try_from(num_inputs + index)?);
                    let output_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;
                    let plaintext = match ciphertext.decrypt_symmetric(output_view_key) {
                        Ok(plaintext) => plaintext,
                        Err(_) => {
                            continue;
                        }
                    };
                    let output = Output::Public(*id, Some(plaintext));
                    decrypted_outputs.push(output.clone());
                }
            } else if let Output::Record(_id, _checksum, _record) = output {
                let (record_pointer, found_amount) = output_to_record_pointer(
                    transaction_id,
                    transition_id.to_owned(),
                    transition.function_name(),
                    transition.program_id(),
                    output,
                    block_height,
                    view_key,
                    index,
                )?;

                match record_pointer {
                    Some(record_pointer) => {
                        record_pointers.push(record_pointer.clone());

                        let encrypted_record_pointer = record_pointer.to_encrypted_data(address)?;
                        store_encrypted_data(encrypted_record_pointer)?;

                        decrypted_outputs.push(output.clone());
                    }
                    None => continue,
                }

                if let Some(found_amount) = found_amount {
                    //parse found amount from u64
                    let found_amount_trimmed = found_amount.trim_end_matches("u64");
                    let found_amount = found_amount_trimmed.parse::<u64>()? as f64 / 1000000.0;

                    amount = Some(found_amount);
                }
            }
        }

        if !decrypted_inputs.is_empty() {
            // form transition pointer
            let transition_pointer = TransitionPointer::new(
                transition_id.to_owned(),
                transaction_id,
                program_id.clone(),
                function_name.clone(),
                timestamp,
                TransitionType::Input,
                message.clone(),
                from.clone(),
                amount,
                block_height,
            );

            let encrypted_transition_pointer = transition_pointer.to_encrypted_data(address)?;
            store_encrypted_data(encrypted_transition_pointer.clone())?;
            encrypted_input_transition_pointers.push(encrypted_transition_pointer);
        }

        if !decrypted_outputs.is_empty() {
            // form transition pointer
            let transition_pointer = TransitionPointer::new(
                transition_id.to_owned(),
                transaction_id,
                program_id,
                function_name,
                timestamp,
                TransitionType::Output,
                message,
                from,
                amount,
                block_height,
            );

            let encrypted_transition_pointer = transition_pointer.to_encrypted_data(address)?;
            store_encrypted_data(encrypted_transition_pointer.clone())?;

            encrypted_output_transition_pointers.push(encrypted_transition_pointer);
        }

        // combine encrypted transition pointers
        let mut encrypted_transition_pointers: Vec<EncryptedData> = vec![];
        encrypted_transition_pointers.append(&mut encrypted_input_transition_pointers);
        encrypted_transition_pointers.append(&mut encrypted_output_transition_pointers);

        Ok((
            record_pointers,
            encrypted_transition_pointers,
            spent_input_ids,
        ))
    }

    pub fn decrypt_transition<N: Network>(
        view_key: ViewKey<N>,
        transition_str: &str,
    ) -> AvailResult<String> {
        let transition: Transition<N> = serde_json::from_str(transition_str)?;

        let scalar = *view_key;
        let tvk = (*transition.tpk() * scalar).to_x_coordinate();

        let function_id = N::hash_bhp1024(
            &(
                U16::<N>::new(N::ID),
                transition.program_id().name(),
                transition.program_id().network(),
                transition.function_name(),
            )
                .to_bits_le(),
        )?;

        let mut decrypted_inputs: Vec<Input<N>> = vec![];
        let mut decrypted_outputs: Vec<Output<N>> = vec![];

        for (index, input) in transition.inputs().iter().enumerate() {
            if let Input::Private(id, Some(ciphertext)) = input {
                let index_field = Field::from_u16(u16::try_from(index)?);
                let input_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;
                let plaintext = ciphertext.decrypt_symmetric(input_view_key)?;
                decrypted_inputs.push(Input::Public(*id, Some(plaintext)));
            } else {
                decrypted_inputs.push(input.clone());
            }
        }

        let num_inputs = transition.inputs().len();
        for (index, output) in transition.outputs().iter().enumerate() {
            if let Output::Private(id, Some(ciphertext)) = output {
                let index_field = Field::from_u16(u16::try_from(num_inputs + index)?);
                let output_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;
                let plaintext = ciphertext.decrypt_symmetric(output_view_key)?;
                decrypted_outputs.push(Output::Public(*id, Some(plaintext)));
            } else {
                decrypted_outputs.push(output.clone());
            }
        }

        let decrypted_transition = Transition::<N>::new(
            *transition.program_id(),
            *transition.function_name(),
            decrypted_inputs,
            decrypted_outputs,
            *transition.tpk(),
            *transition.tcm(),
        )?;

        let transition_output = serde_json::to_string(&decrypted_transition)?;

        Ok(transition_output)
    }

    pub fn decrypt_inputs_outputs<N: Network>(
        view_key: ViewKey<N>,
        transition: &Transition<N>,
    ) -> AvailResult<(Vec<String>, Vec<String>)> {
        let scalar = *view_key;
        let tvk = (*transition.tpk() * scalar).to_x_coordinate();

        let function_id = N::hash_bhp1024(
            &(
                U16::<N>::new(N::ID),
                transition.program_id().name(),
                transition.program_id().network(),
                transition.function_name(),
            )
                .to_bits_le(),
        )?;

        let mut decrypted_inputs: Vec<String> = vec![];
        let mut decrypted_outputs: Vec<String> = vec![];

        let (stored_record_pointers, _ids) = get_record_pointers_ids::<N>()?;

        for (index, input) in transition.inputs().iter().enumerate() {
            if let Input::Private(_id, ciphertext_option) = input {
                if let Some(ciphertext) = ciphertext_option {
                    let index_field = Field::from_u16(u16::try_from(index)?);

                    let input_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;
                    let input_str = match ciphertext.decrypt_symmetric(input_view_key) {
                        Ok(plaintext) => plaintext.to_string(),
                        Err(_) => ciphertext.to_string(),
                    };

                    decrypted_inputs.push(input_str);
                } else {
                    decrypted_inputs.push(input.to_string());
                }
            } else if let Input::Record(_serial_number, tag) = input {
                for record_pointer in stored_record_pointers.iter() {
                    if &record_pointer.tag()? == tag {
                        let record = record_pointer.to_record()?;
                        decrypted_inputs.push(record.to_string());
                    }
                }
            } else if let Input::Public(_plaintext_hash, plaintext) = input {
                if let Some(plaintext) = plaintext {
                    decrypted_inputs.push(plaintext.to_string());
                }
            } else if let Input::Constant(_plaintext_hash, plaintext) = input {
                if let Some(plaintext) = plaintext {
                    decrypted_inputs.push(plaintext.to_string());
                }
            } else if let Input::ExternalRecord(_input_commitent) = input {
                //handle external record input
            }
        }

        let num_inputs = transition.inputs().len();
        for (index, output) in transition.outputs().iter().enumerate() {
            if let Output::Private(_id, ciphertext_option) = output {
                if let Some(ciphertext) = ciphertext_option {
                    let index_field = Field::from_u16(u16::try_from(num_inputs + index)?);

                    let output_view_key = N::hash_psd4(&[function_id, tvk, index_field])?;
                    let output_str = match ciphertext.decrypt_symmetric(output_view_key) {
                        Ok(plaintext) => plaintext.to_string(),
                        Err(_) => ciphertext.to_string(),
                    };

                    decrypted_outputs.push(output_str);
                } else {
                    decrypted_outputs.push(output.to_string());
                }
            } else if let Output::Record(_commitment, _checksum, ciphertext) = output {
                match ciphertext {
                    Some(ciphertext) => {
                        // do i own this output?
                        let record = match ciphertext.decrypt(&view_key) {
                            Ok(plaintext) => plaintext.to_string(),
                            Err(_) => ciphertext.to_string(),
                        };

                        decrypted_outputs.push(record);
                    }
                    None => {
                        decrypted_outputs.push(output.to_string());
                    }
                }
            } else if let Output::Public(_plaintext_hash, plaintext) = output {
                if let Some(_plaintext) = plaintext {
                    decrypted_outputs.push(output.to_string());
                }
            } else if let Output::Future(_future_hash, future) = output {
                if let Some(future) = future {
                    decrypted_outputs.push(future.to_string());
                }
            } else if let Output::Constant(_plaintext_hash, plaintext) = output {
                if let Some(plaintext) = plaintext {
                    decrypted_outputs.push(plaintext.to_string());
                }
            } else {
                decrypted_outputs.push(output.to_string());
            }
        }
        Ok((decrypted_inputs, decrypted_outputs))
    }
}

pub fn find_amount_from_public_transfer<N: Network>(inputs: &[Input<N>]) -> Option<f64> {
    for input in inputs {
        print!("{:?}", input);
        if let Input::Public(_plaintext_hash, Some(Plaintext::Literal(Literal::U64(amount), _))) =
            input
        {
            print!("{:?}", amount);
            return Some(**amount as f64 / 1000000.0);
        }
    }
    None
}

#[cfg(test)]
mod tests {
    use std::str::FromStr;

    use snarkvm::console::network::Testnet3;
    use snarkvm::prelude::PrivateKey;

    use super::*;
    use avail_common::models::constants::*;

    const VIEW_KEY: &str = "AViewKey1nPQW8P83ajkMBHQwYjbUfjGHVSkBQ5wctpJJmQvW1SyZ";
    const INCORRECT_VIEW_KEY: &str = "AViewKey1o8Hqq4tVbVMeeGtkEGUR7ULghFN8j89sqNQKYRZfe21u";
    const TRANSITION_VIEW_KEY: &str = "AViewKey1mSnpFFC8Mj4fXbK5YiWgZ3mjiV8CxA79bYNa8ymUpTrw";
    const TRANSITION: &str = r#"
      {
        "id": "as1pe954nkrsz4ztq7tphfug0cxtk4t0v5nnh885llkxufkckc0pcqq64fdjh",
        "program": "credits.aleo",
        "function": "transfer",
        "inputs": [
            {
                "type": "record",
                "id": "7627242362896255517779759121644670167065542804779447008052019369271498021878field",
                "tag": "7326825649979738473754819542510294000608550604334299567498630301585328020355field"
            },
            {
                "type": "private",
                "id": "5890350227539634203276798567594921209939645071583932668707733854543695228358field",
                "value": "ciphertext1qgqz2ypza9srfjnncjzz3hegltwmk0y348ufmklcuqwep2u9wnsqwqkrgx49dn0x78uqypznmyv8r80zwkte9rkfucv7fk4hw7w5s86dzyjmktp7"
            },
            {
                "type": "private",
                "id": "3523824429192332435402492789955521910058950257573863610460494169456702420796field",
                "value": "ciphertext1qyqfuz7006rcq9utzdsthdxqv4ra59u58wuggcacv44ka5uv7gyjcrsfh5xwh"
            }
        ],
        "outputs": [
            {
                "type": "record",
                "id": "8375863992930925508608168893083821026035462437311607208725719081756051927038field",
                "checksum": "327996249778261324588393772992776501551729208590293775377741829891566277743field",
                "value": "record1qyqsqv0te3n9fws54jjywmrp36lc8l5gxgzyc9anjk30qsf7h45nfvgpqyxx66trwfhkxun9v35hguerqqpqzq8hd7es9dptx8l6ldn7u536g3hefvl03e6ztrufgk97ekf0us6azgl65lhfgcm4jf7fua2pcc2asy7r46rzv7eefvc8yrs39sgadue3zkl3emg"
            },
            {
                "type": "record",
                "id": "3831168224702324801478452706121992429555677457517630037556628292830553507758field",
                "checksum": "104402939347002555939092140274082734465350067270030368157770539944634402431field",
                "value": "record1qyqspsy0qghu8wqmf8wq2w4ccqqg8zsgxc3ge2znf4uklh8tutq2swgqqyxx66trwfhkxun9v35hguerqqpqzq9c6u30j7srax79wdvdqt2ytpne4vyvae6z9fq85rs09nj2f72uqm0kn9tx5t3znnj7hrqffzdcquacgyrqdfuuum2km7wvxcmy258svvkjzsh"
            }
        ],
        "proof": "proof1qqqqzqqqqqqqqqqqjgn70r0h5xcsysua8uve5wk400ash3ry6dwr3jjmeft5dmmql03ju0memtrwzppfsyl9x25v6svgrled6hd4s2887yz6wdde7fmv3kwlrdjx8kpvzq5asy02sljyc87ya7me3h5nkh3davwqklw6m2qzszt850x7jq0kt45zghwah6kalw7ufdh2v83jcrcwcpcwwa0m44sestdagm0z7hqe20zlfszva22kfqgpvnj9mavgqw2v5rmeeyz8hmn2j29npkvgteg0447zh6c097tx4dr2vmu2n5ts67xqu83058sjus3srrdgcypql8mymv7rhg580m5gckc4vnwjm2a53vg9sgqmyahs4fhmm0t0atyp9gjvflpt76d2nnsaqyqntm08rmtg0mwzajy2lpyfgq0r0gwq6pqcraty4623uyrzz8036np4clx3ak54qdlfamprav0chq95d696hsy4sdpsfphxuzq5mmehl0pjgk3f7wuvtjshz9dyrnrcwggnmjdqw965fmnjhlxv86ddruqj3cur9r38g2v4evaf2n5clr0844aek7j2gvz4zgshfddlkrg92wzk4yfwdjrwuvmpv77ss2f3efypelqu8sjp23fk93ygdads9lqtz8ghggdy5uhe9j7cyrg2ug4ghww9vvfljk2rgk04sfm23n8j474gzsmzz0nptrtdqmr2afddp5acssa5twxlcpf6vcghssrdan52wrykz5evryzvarw0xj9y0zf2ddarqxqfv2rcjfey9ur7tmaeh2qvqv8z9ggg8vtajql6vj2vuw5shmxsjahcq2ve7m3m3s8a30vy0qx47u263g77hz448mxug4r99vfgkpggv7rysklv0e9l40nt20uvnkuepeftgqwlz7t436z93fpq5qadxsr2tl93t87czw68h6nsglh9xxnenasa2f68vl7pvqahnjlyatcvzyytqxrglvgax9525hwvn939k9jtxzjeh97chr07qgvsp6f007c3p7hdca6cm7ss7wmdrefehzzpj4rpj30cnu2rhdce35ku3y640avsxlujsxnfs69g32q3nlqe7tlcka9zkmeurxx3fcq054sseehe2kqjr2tfdwmgfzgj28vynw4nxq54pvmpgkj53asfnt25yz250lmx0vzqyqqqqqqqqqqq9c4hem5wef967dqy4spcypsr8kwhnmxp35zlrdgq6rwejyqej2l2h6w2lnc7ttw2qxlj8shfju5czqwrcnaj00ky0yc98jck2rk43upw4gzxk6l866n0mh68q0vjalg0qd7tvlu4an04s3u799u28vct6wwm2gn0r5lpcv5jttds6ffw6ykkq6g42yvlam6zreceeqwqz25mrqqqqqppqwa5",
        "tpk": "853764860907185272244987221391264508066723405990098126446569313951469774602group",
        "tcm": "2890501131780933954363007654088502278361631362478553633880506988907453958068field"
      }
    "#;
    const TRANSITION2: &str = r#"
      {
        "id":"au12llfye62hrxva7kdtk6c8qjff5w06pys77qaf74yvk8nm36pcvzqzhnyqk",
        "program":"credits.aleo",
        "function":"transfer_public_to_private",
        "inputs":[
            {
                "type":"private",
                "id":"8304400100965833495700876350325817857909709976454835525511070424468112487393field",
                "value":"ciphertext1qgqqra9lu5kxlcyantu9m62y64q6a6lqnpwnjhw7sfhzpvfs3xfrkzvd3f8y43ayxvg06m0jdy5mygzkq5xtzhesnaevv2sevtrr8tlups2ylg7q"
            },
            {
                "type":"public",
                "id":"4284736765818567156746053297849217056635200819021601944769636535729298276732field",
                "value":"10000u64"
            }
            ],
            "outputs":[
                {
                    "type":"record",
                    "id":"7700798280026244642782503068152162345162841409942906121174875714371266381229field",
                    "checksum":"6815669942399919593565610266251968344648606815539211826018363024847516584293field",
                    "value":"record1qyqsqyqj75z6agymcp8n3zc3vdt79flrvmkntw3x3ns9r62cajs28rs9qyxx66trwfhkxun9v35hguerqqpqzq82x8jygs6uu3xv5vvsfqmhxwp0mgd6cp94s9tltctq6k7kfk5xp6f70g4ehp4cu3uky7gt7dsfe5lxgg9v8f89zfqhckxdy4fjlt3sgeectyv"},
                    {
                        "type":"future",
                        "id":"7497616154742727853190695963847945689716274231039404007173109580428445795806field",
                        "value":"{\n  program_id: credits.aleo,\n  function_name: transfer_public_to_private,\n  arguments: [\n    aleo1rhgdu77hgyqd3xjj8ucu3jj9r2krwz6mnzyd80gncr5fxcwlh5rsvzp9px,\n    10000u64\n  ]\n}"}],
                        "tpk":"7536197841680445770427840516566211501284881266835565366311996370053681646595group",
                        "tcm":"5280795820292733910634681057195416067603461129653774341851374878700562172179field"
                    }
    "#;

    #[test]
    fn test_decrypt_transition() {
        let private_key = PrivateKey::<Testnet3>::from_str(TESTNET_PRIVATE_KEY).unwrap();
        let view_key = ViewKey::<Testnet3>::try_from(private_key).unwrap();

        let decrypted_transition_str =
            DecryptTransition::decrypt_transition(view_key, TRANSITION2).unwrap();

        let decrypted_transition: Transition<Testnet3> =
            serde_json::from_str(&decrypted_transition_str.clone()).unwrap();

        println!("Decrypted Transition {:?}", decrypted_transition);
        let public_input = decrypted_transition
            .inputs()
            .into_iter()
            .skip(1)
            .next()
            .unwrap();
        /*
        if let Input::Public(_id, plaintext_option) = public_input {
            let plaintext = plaintext_option.as_ref().unwrap();
            assert_eq!(
                plaintext.to_string(),
                "aleo146dx5e4nssf49t0aq9qljk474kqxk848tl05m8w84vc0jqa30spqf4me04"
            );
        } else {
            panic!("Expected public input");
        }
        */
        // let public_output = decrypted_transition.outputs().into_iter().next().unwrap();

        // if let Output::Public(_id, plaintext_option) = public_output {
        //     let plaintext = plaintext_option.as_ref().unwrap();
        //     assert_eq!(plaintext.to_string(), "100000000u64");
        // } else {
        //     panic!("Expected public output");
        // }
    }

    fn test_decrypt_ciphertext_input() {
        let view_key = ViewKey::<Testnet3>::from_str(VIEW_KEY).unwrap();

        // Try decrypting private input
        let plaintext = DecryptTransition::decrypt_ciphertext(
            view_key,
            "ciphertext1qyq2786j69kjqmwz7lk9cn3glyq2w34j6zhlvxum6u9xkfk76hmd2rgg34kev",
            "3681563105640905751787370687361466941855498391730203508101562167054325552256group",
            "helloworld.aleo",
            "main",
            1,
        )
        .unwrap();

        assert_eq!(plaintext, "2u32");
    }

    #[test]
    fn test_decrypt_ciphertext_output() {
        let view_key = ViewKey::<Testnet3>::from_str(VIEW_KEY).unwrap();

        // Try decrypting private output
        let plaintext = DecryptTransition::decrypt_ciphertext(
            view_key,
            "ciphertext1qyqw68078jwlvz6v2wynue3g3dndyv0ydqutlmn99sfashquhkf52zql6xu7r",
            "3681563105640905751787370687361466941855498391730203508101562167054325552256group",
            "helloworld.aleo",
            "main",
            2,
        )
        .unwrap();

        assert_eq!(plaintext, "3u32");
    }

    #[test]
    fn test_owns_transition_true() {
        let view_key = ViewKey::<Testnet3>::from_str(VIEW_KEY).unwrap();

        let owns_transition = DecryptTransition::owns_transition(
            view_key,
            Group::<Testnet3>::from_str(
                "3681563105640905751787370687361466941855498391730203508101562167054325552256group",
            )
            .unwrap(),
            Field::<Testnet3>::from_str(
                "3205548165782039452146864733009325261935114902820697593223360259711032449007field",
            )
            .unwrap(),
        )
        .unwrap();

        assert!(owns_transition);
    }

    #[test]
    fn test_owns_transition_false() {
        let view_key = ViewKey::<Testnet3>::from_str(INCORRECT_VIEW_KEY).unwrap();

        let owns_transition = DecryptTransition::owns_transition(
            view_key,
            Group::<Testnet3>::from_str(
                "3681563105640905751787370687361466941855498391730203508101562167054325552256group",
            )
            .unwrap(),
            Field::<Testnet3>::from_str(
                "3205548165782039452146864733009325261935114902820697593223360259711032449007field",
            )
            .unwrap(),
        )
        .unwrap();

        assert!(!owns_transition);
    }
}
