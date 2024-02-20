# Notes on Record Handling

## The tag system
`tag`  construction, the `tag` is not stored with the record as tag but can be computed via `N::hash_psd2(&[sk_tag, commitment])` as we do where `sk_tag` can only be derived from your `view_key` , and then the tag is stored on chain when this record is spent so you can literally query a block for all the tags it stores and these would be all the tags of records spent within that block. But you cannot check if a specific record has been spent without the viewing key.
