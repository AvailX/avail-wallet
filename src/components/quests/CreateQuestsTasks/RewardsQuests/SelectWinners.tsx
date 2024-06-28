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
import { createQuest } from "../../../../services/quests/quests";
import { Quest } from "../../../../types/quests/quest_types";
import { useNavigate } from "react-router-dom";
import ScanReAuthDialog from "../../../dialogs/reauth";
import { ErrorAlert, SuccessAlert } from "../../../snackbars/alerts";

// Define the validation schema using Yup
const schema = yup.object().shape({
  rewardName: yup.string().required("Reward Collection Name is required"),
  rewardAmount: yup.number().positive("Points must be positive").required("Reward Amount is required"),
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

  const [reAuthDialogOpen, setReAuthDialogOpen] = React.useState(false);
  const [success, setSuccess] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const navigate = useNavigate();

  const { formField, setFormField } = useQuestContext();

  const [createdOn, setCreatedOn] = useState(
    new Date().toISOString().slice(0, 10)
  );

  const onSubmit = (data: FieldValues) => {
    const updatedFormField = { ...formField, ...data, createdOn };
    setFormField(updatedFormField);
    console.log("Form field:", updatedFormField);
    console.log("Create Quest Clicked");
    console.log("Title:", formField.taskTitle);
    console.log("Desc:", formField.describeQuest);
    console.log("Quest Image:", formField.desktopUrl);
    console.log("Tasks:", JSON.stringify(formField.task));
    console.log("Reward:", formField.rewardName);
    console.log("Reward Amount:", formField.rewardAmount);
    console.log("Mechanism:", formField.mechanism);
    console.log("Expires On:", formField.expiresOn);
    console.log("Created On:", createdOn);
    console.log("Campaign ID:", campaignId);
    handleAddQuest();
  };
  const currentDate = new Date();
  const handleAddQuest = () => {
    createQuest(
      formField.taskTitle,
      formField.describeQuest,
      formField.desktopUrl,
      JSON.stringify(formField.task),
      formField.rewardName,
      formField.rewardAmount.toString(),
      formField.mechanism,
      formField.expiresOn,
      currentDate,
      campaignId,
    ).then((quest) => {
      console.log("Quest Created:", quest);
      setSuccess(true);
      setMessage("Quest Created");
      navigate("/campaigns");
    })
      .catch((err) => {
        console.log(err);
        if (err.error_type.toString() === "Unauthorized") {
          // eslint-disable-next-line no-warning-comments
          // TODO - Re-authenticate and fix execution on re-auth (Bala)

          console.log("Unauthorized, re auth");

          setReAuthDialogOpen(true);
        } else {
          setError(true);
          setMessage(`Campaign Creation Failed: ${err.external_msg}`);
        }
      });
  };

  return (
    <mui.Box
      component='form'
      onSubmit={handleSubmit(onSubmit)}
      sx={{ width: "100%" }}
    >
      <ErrorAlert
        errorAlert={error}
        setErrorAlert={setError}
        message={message}
      />
      <SuccessAlert
        successAlert={success}
        setSuccessAlert={setSuccess}
        message={message}
      />
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
            name='rewardAmount'
            control={control}
            render={({ field }) => (
              <mui.TextField
                {...field}
                error={!!errors.rewardAmount}
                helperText={errors.rewardAmount ? errors.rewardAmount.message : ""}
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
                  border: "1px solid #2E9368",
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
        sx={{ color: "#fff", textTransform: "inherit", mt: 3 }}
        variant='contained'
        type='submit'
      >
        Launch
      </mui.Button>
      {/* ReAuth Dialog */}
      <ScanReAuthDialog
        isOpen={reAuthDialogOpen}
        onRequestClose={() => {
          setReAuthDialogOpen(false);
        }}
      />
    </mui.Box>

  );
};

export default SelectWinners;