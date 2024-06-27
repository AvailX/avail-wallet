import * as React from "react";
import { useState } from "react";
import * as mui from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { useForm, Controller, FieldValues } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";

import { useQuestContext } from "../../../../views-desktop/quests/CreateTask";

// Define the validation schema using Yup
const schema = yup.object().shape({
  rewardName: yup.string().required("Reward Collection Name is required"),
  username: yup.string().required("Reward Amount is required"),
  mechanism: yup.string().required("Mechanism is required"),
  expiresOn: yup.date().required("Expires On is required"),
});

const SelectWinners: React.FC<{ campaignId: string }> = ({ campaignId }) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
  });

  const { formField, setFormField } = useQuestContext();

  const [createdOn, setCreatedOn] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const onSubmit = (data: FieldValues) => {
    console.log("Form Data:", data);
    console.log("Created On:", createdOn);

    setFormField({ ...formField, data, createdOn });
    console.log("Form field", formField);
  };

  return (
    <mui.Box sx={{ width: "100%" }}>
      <mui.Stack spacing={2}>
        <mui.Stack direction='column' spacing={0}>
          <mui.Typography
            color='#fff'
            fontSize='15px'
            sx={{ mb: 1 }}
            fontWeight={200}
          >
            Reward Collection Name
          </mui.Typography>
          <Controller
            name='rewardName'
            control={control}
            render={({ field }) => (
              <mui.TextField
                {...field}
                error={!!errors.rewardName}
                helperText={errors.rewardName ? errors.rewardName.message : ""}
                sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
              />
            )}
          />
        </mui.Stack>
        <mui.Stack direction='column' spacing={0}>
          <mui.Typography
            color='#fff'
            fontSize='15px'
            sx={{ mb: 1 }}
            fontWeight={200}
          >
            Reward Amount
          </mui.Typography>
          <Controller
            name='username'
            control={control}
            render={({ field }) => (
              <mui.TextField
                {...field}
                error={!!errors.username}
                helperText={errors.username ? errors.username.message : ""}
                sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
              />
            )}
          />
        </mui.Stack>
        <mui.Stack direction='column' spacing={0}>
          <InputLabel
            id='mechanism-label'
            sx={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: "200",
              mb: 1,
            }}
          >
            Mechanism
          </InputLabel>
          <Controller
            name='mechanism'
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                labelId='mechanism-label'
                id='mechanism'
                sx={{
                  bgcolor: "#2A2C2B",
                  border: "1px solid #2e9368",
                  color: "#fff",
                  fontSize: "15px",
                  fontWeight: "200",
                }}
              >
                <MenuItem value=''>
                  <em>None</em>
                </MenuItem>
                <MenuItem value='FCFS'>FCFS</MenuItem>
                <MenuItem value='Leaderboard'>Leaderboard</MenuItem>
                <MenuItem value='LuckyDraw'>LuckyDraw</MenuItem>
              </Select>
            )}
          />
          {errors.mechanism && (
            <mui.Typography color='error' fontSize='12px'>
              {errors.mechanism.message}
            </mui.Typography>
          )}
        </mui.Stack>
        <mui.Stack direction='column' spacing={1}>
          <InputLabel
            id='expiresOn-label'
            sx={{
              color: "#fff",
              fontSize: "15px",
              fontWeight: "200",
              mb: 1,
            }}
          >
            Expires On
          </InputLabel>
          <Controller
            name='expiresOn'
            control={control}
            render={({ field }) => (
              <mui.TextField
                {...field}
                type='date'
                error={!!errors.expiresOn}
                helperText={errors.expiresOn ? errors.expiresOn.message : ""}
                InputLabelProps={{ shrink: true, style: { color: "white" } }}
                sx={{ bgcolor: "#2A2C2B", borderRadius: "10px" }}
              />
            )}
          />
        </mui.Stack>
      </mui.Stack>
      <mui.Button
        fullWidth
        sx={{ color: "fff", textTransform: "inherit", mt: 3 }}
        variant='contained'
        onClick={handleSubmit(onSubmit)}
      >
        Launch
      </mui.Button>
    </mui.Box>
  );
};

export default SelectWinners;
