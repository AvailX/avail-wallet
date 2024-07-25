import { Box, Typography } from "@mui/material";

const NftDetailsDisplay = () => {
  return (
    <Box bgcolor='#2A2A2A' borderRadius='18px 18px 0px 0px' p={3}>
      <img
        width='282px'
        style={{ borderRadius: "22px" }}
        src='https://s3-alpha-sig.figma.com/img/2a1f/8cea/9a0a71d9de22463882be80e6921fad8a?Expires=1716768000&Key-Pair-Id=APKAQ4GOSFWCVNEHN3O4&Signature=cL5rzS3f52ygzPtuG7a79vxOAc6dlATSYjHRIUhWATir5gfQvGNv8CcbF1z8nolRDq3r4~ANywKZ4-XaoFjFKGmOMbJ59Jb8llPMCYL3xA9qOb~pTzOBpI05AvhDJzFvQBHFcTw94NaS5VizvySDWW7rElFWNy8srvrvUogMFwiq3UxrZA7AKWBsPRVwbdSwEHEQbrBlR2a7ay48lHzLNoMutgWBIyeA~yc6CKUvAL1tUXKtFJPargZQ~Bk2FqBfe~GJ7FeXBxuDD9i0KyR8VcILPJmHQkpCjBL2SgtS4BBbAo-SFZ4p1UMSL9ke54ESrz1v15Nxbjy3LOMz0QN7gw__'
      />
      <Box display='flex' alignItems='center' justifyContent='space-between'>
        <Box textAlign='left'>
          <Typography fontSize='25px' fontWeight={700}>
            Disruptor
          </Typography>
          <Typography mt={-1} fontSize='25px' fontWeight={700}>
            #4795
          </Typography>
        </Box>
        <Box textAlign='right'>
          <Typography color='#B0B0B0'>Current Price</Typography>
          <Typography fontSize='25px' fontWeight={700}>
            10 ALO
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default NftDetailsDisplay;
