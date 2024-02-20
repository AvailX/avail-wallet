// Multi Threaded get_records - in construction FIX: Output not matching
//gets the records form the latest aleo blocks and forms and returns a vector of our local block type
/*
fn get_nova_records<N: Network>(last_sync: u32) -> AvailResult<(Vec<Block>, Vec<String>)> {
    let view_key = get_view_session::<N>()?;

    let api_client = AleoAPIClient::<N>::local_testnet3("3030");
    let chunk_size = 49;

    let latest_height = api_client.latest_height()?;

    let total_blocks_num = latest_height.sub(last_sync);
    let num_chunks = total_blocks_num / chunk_size;

    let chunk_ranges: Vec<(u32, u32)> = (0..num_chunks)
        .map(|chunk_index| {
            let start_block = chunk_index * chunk_size;
            let end_block = (start_block + chunk_size).min(total_blocks_num);
            (start_block, end_block)
        })
        .collect();

    let synced_encrypted_blocks = get_encrypted_data_by_flavour(EncryptedDataTypeCommon::Block)?
        .iter()
        .map(|data| Ok(deserialize(&data.data)?))
        .collect::<Result<Vec<EncryptionResult>, AvError>>()?;

    //decrypt and form a vector of block heights
    let synced_blocks = synced_encrypted_blocks
        .iter()
        .map(|block| Block::decrypt(block.to_owned()).unwrap())
        .map(|block| block.block_height)
        .collect::<Vec<u32>>();

    let address_x_coordinate = view_key.to_address().to_x_coordinate();

    let sk_tag = GraphKey::try_from(view_key)?.sk_tag();

    let mut end_height = latest_height;
    let mut start_height = latest_height.sub(step_size);

    let mut tags: Vec<String> = vec![];
    let mut new_record_blocks: Vec<Block> = vec![];

    for _ in (last_sync..latest_height).step_by(step_size as usize) {
        println!("start_height: {:?}", start_height);
        println!("end_height: {:?}", end_height);
        let blocks = api_client.get_blocks(start_height, end_height)?;

            let blocks = match blocks {
                Ok(res) => res,
                Err(_) => {
                    return Err(AvailError::new(
                        AvailErrorType::Internal,
                        "Error getting blocks".to_string(),
                        "".to_string(),
                    ));
                }
            };

        tags.append(&mut current_tags);

        //remove any blocks that are already synced
        let blocks = blocks
            .clone()
            .into_iter()
            .filter(|block| !synced_blocks.contains(&block.height()))
            .collect::<Vec<AleoBlock<N>>>();

        let mut optimized_blocks = blocks
            .iter()
            .map(|block| {
                let records = block.clone().into_records();
                let height = block.height();

                let identifiers = records
                    .into_iter()
                    .filter(|(_, record)| {
                        record.is_owner_with_address_x_coordinate(&view_key, &address_x_coordinate)
                    })
                    .filter_map(|(commitment, record)| {
                        let record = record.decrypt(&view_key).ok()?;
                        let tag = Record::<N, Plaintext<N>>::tag(sk_tag, commitment).ok()?;
                        let amount = record.microcredits().ok()?;
                        if amount == 0 {
                            None
                        } else {
                            Some(Identifiers::new(
                                commitment.to_string(),
                                tag.to_string(),
                                amount,
                                "unspent".to_string(),
                            ))
                        }
                    })
                    .collect();

                Block::new(height, identifiers)
            })
            .collect::<Vec<Block>>();

        // Search in reverse order from the latest block to the earliest block
        end_height = start_height;
        start_height = start_height.saturating_sub(step_size);
        if start_height < last_sync {
            start_height = last_sync
        };

            Ok(avail_blocks)
        })


    let tags = tags.into_inner();

    let tags = match tags {
        Ok(res) => res,
        Err(_) => {
            return Err(AvailError::new(
                AvailErrorType::Internal,
                "Mutex error ".to_string(),
                "".to_string(),
            ));
        }
    };

    Ok((new_record_blocks, tags))
}*/
