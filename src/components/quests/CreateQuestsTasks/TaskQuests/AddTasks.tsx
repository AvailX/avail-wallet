import * as React from "react";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as mui from "@mui/material";
import { createQuest } from "../../../../services/quests/quests";

const taskSchema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  transaction: yup.string().required("Transaction is required"),
  program_id: yup.string().required("Program ID is required"),
  function_id: yup.string().required("Function ID is required"),
  dapp_url: yup
    .string()
    .url("Must be a valid URL")
    .required("Dapp URL is required"),
  points: yup
    .number()
    .positive("Points must be positive")
    .required("Points are required"),
});

const schema = yup.object().shape({
  title: yup.string().required("Title is required"),
  description: yup.string().required("Description is required"),
  displayImage: yup
    .string()
    .url("Must be a valid URL")
    .required("Display Image is required"),
  tasks: yup.array().of(taskSchema).min(1, "At least one task is required"),
  rewardCollectionName: yup
    .string()
    .required("Reward Collection Name is required"),
  rewardAmount: yup
    .number()
    .positive("Reward Amount must be positive")
    .required("Reward Amount is required"),
  rewardMethod: yup
    .string()
    .oneOf(["FCFS", "LeaderBoard", "LuckyDraw"], "Select a valid reward method")
    .required("Reward Method is required"),
  expiresOn: yup.date().required("Expiration date is required"),
  createdOn: yup.date().required("Creation date is required"),
  campaignId: yup.string().required("Campaign ID is required"),
});

const AddTasks: React.FC = () => {
  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      description: "",
      displayImage: "",
      tasks: [
        {
          title: "",
          description: "",
          transaction: "",
          program_id: "",
          function_id: "",
          dapp_url: "",
          points: "",
        },
      ],
      rewardCollectionName: "",
      rewardAmount: "",
      rewardMethod: "",
      expiresOn: "",
      createdOn: "",
      campaignId: "",
    },
  });

  const { fields, append } = useFieldArray({
    control,
    name: "tasks",
  });

  const onSubmit = async (data: any) => {
    try {
      const time = new Date();
      const response = await createQuest(
        data.title,
        data.description,
        data.displayImage,
        JSON.stringify(data.tasks),
        data.rewardCollectionName,
        data.rewardAmount,
        data.rewardMethod,
        time,
        time,
        data.campaignId
      );
      console.log("Quest Created:", response);
    } catch (error) {
      console.error("Quest Creation Failed", error);
    }
  };

  return (
    <mui.ThemeProvider
      theme={mui.createTheme({
        palette: {
          primary: { main: "#00FFAA" },
        },
        components: {
          MuiTextField: {
            defaultProps: {
              InputLabelProps: {
                style: { color: "#fff", opacity: "50%" },
              },
            },
            styleOverrides: {
              root: {
                "&.MuiOutlinedInput-notchedOutline": {
                  borderColor: "#00FFAA",
                },
                "& .MuiOutlinedInput-root": {
                  "& fieldset": {
                    borderColor: "#00FFAA",
                  },
                  "&:hover fieldset": {
                    borderColor: "#00FFAA",
                  },
                  "&.Mui-focused fieldset": {
                    borderColor: "#00FFAA",
                  },
                },
              },
            },
          },
        },
      })}
    >
      <mui.Box
        sx={{
          display: "flex",
          flexDirection: "column",
          width: "100%",
          mb: "5%",
        }}
      >
        <mui.Typography variant='h4' color={"white"} fontWeight={"bold"}>
          Add Tasks
        </mui.Typography>
        <mui.Box
          sx={{
            display: "flex",
            height: "50px",
            width: "100%",
            backgroundColor: "#2A2C2B",
            border: "none",
            borderRadius: "15px",
            alignItems: "center",
            fontSize: "12px",
            justifyContent: "center",
          }}
        >
          <mui.TextField
            fullWidth
            label='Select Task'
            variant='standard'
            InputProps={{
              sx: {
                ml: "10px",
                color: "#00FFAA",
                "& .MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:hover:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none",
                },
              },
              disableUnderline: true,
            }}
            InputLabelProps={{
              sx: {
                color: "#00FFAA",
                ml: "10px",
              },
            }}
          />
        </mui.Box>

        <mui.Box marginLeft='10%'>
          <h1 style={{ color: "white" }}>Create Quests</h1>
          <form
            onSubmit={handleSubmit(onSubmit)}
            style={{ display: "flex", flexDirection: "column" }}
          >
            <Controller
              name='title'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Title'
                  sx={{ my: 2 }}
                  error={Boolean(errors.title)}
                  helperText={errors.title ? errors.title.message : ""}
                />
              )}
            />
            <Controller
              name='description'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Description'
                  sx={{ my: 2 }}
                  error={Boolean(errors.description)}
                  helperText={
                    errors.description ? errors.description.message : ""
                  }
                />
              )}
            />
            <Controller
              name='displayImage'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Display Image'
                  sx={{ my: 2 }}
                  error={Boolean(errors.displayImage)}
                  helperText={
                    errors.displayImage ? errors.displayImage.message : ""
                  }
                />
              )}
            />

            <h1 style={{ color: "white" }}>Tasks</h1>
            {fields.map((field, index) => (
              <div
                key={field.id}
                style={{ display: "flex", flexDirection: "column" }}
              >
                <Controller
                  name={`tasks.${index}.title`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Task Name'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.title)}
                      helperText={
                        errors.tasks?.[index]?.title
                          ? errors.tasks[index].title.message
                          : ""
                      }
                    />
                  )}
                />
                <Controller
                  name={`tasks.${index}.description`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Description'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.description)}
                      helperText={
                        errors.tasks?.[index]?.description
                          ? errors.tasks[index].description.message
                          : ""
                      }
                    />
                  )}
                />
                <Controller
                  name={`tasks.${index}.transaction`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Transaction'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.transaction)}
                      helperText={
                        errors.tasks?.[index]?.transaction
                          ? errors.tasks[index].transaction.message
                          : ""
                      }
                    />
                  )}
                />
                <Controller
                  name={`tasks.${index}.program_id`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Program ID'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.program_id)}
                      helperText={
                        errors.tasks?.[index]?.program_id
                          ? errors.tasks[index].program_id.message
                          : ""
                      }
                    />
                  )}
                />
                <Controller
                  name={`tasks.${index}.function_id`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Function ID'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.function_id)}
                      helperText={
                        errors.tasks?.[index]?.function_id
                          ? errors.tasks[index].function_id.message
                          : ""
                      }
                    />
                  )}
                />
                <Controller
                  name={`tasks.${index}.dapp_url`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Dapp URL'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.dapp_url)}
                      helperText={
                        errors.tasks?.[index]?.dapp_url
                          ? errors.tasks[index].dapp_url.message
                          : ""
                      }
                    />
                  )}
                />
                <Controller
                  name={`tasks.${index}.points`}
                  control={control}
                  render={({ field }) => (
                    <mui.TextField
                      {...field}
                      label='Points'
                      sx={{ my: 2 }}
                      error={Boolean(errors.tasks?.[index]?.points)}
                      helperText={
                        errors.tasks?.[index]?.points
                          ? errors.tasks[index].points.message
                          : ""
                      }
                    />
                  )}
                />
              </div>
            ))}

            <mui.Button
              type='button'
              onClick={() =>
                append({
                  title: "",
                  description: "",
                  transaction: "",
                  program_id: "",
                  function_id: "",
                  dapp_url: "",
                  points: "",
                })
              }
            >
              Add Field
            </mui.Button>
            <br />
            <h1 style={{ color: "white" }}>Reward Mechanism</h1>
            <Controller
              name='rewardCollectionName'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Reward Collection Name'
                  sx={{ my: 2 }}
                  error={Boolean(errors.rewardCollectionName)}
                  helperText={
                    errors.rewardCollectionName
                      ? errors.rewardCollectionName.message
                      : ""
                  }
                />
              )}
            />
            <Controller
              name='rewardAmount'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Reward Amount'
                  sx={{ my: 2 }}
                  error={Boolean(errors.rewardAmount)}
                  helperText={
                    errors.rewardAmount ? errors.rewardAmount.message : ""
                  }
                />
              )}
            />
            <Controller
              name='rewardMethod'
              control={control}
              render={({ field }) => (
                <mui.Select
                  {...field}
                  label='Reward Method'
                  sx={{ my: 2 }}
                  error={Boolean(errors.rewardMethod)}
                >
                  <mui.MenuItem value='FCFS'> FCFS</mui.MenuItem>
                  <mui.MenuItem value='LeaderBoard'>LeaderBoard</mui.MenuItem>
                  <mui.MenuItem value='LuckyDraw'>LuckyDraw</mui.MenuItem>
                </mui.Select>
              )}
            />
            <Controller
              name='expiresOn'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Expires On'
                  sx={{ my: 2 }}
                  type='date'
                  InputLabelProps={{ shrink: true, color: "primary" }}
                  error={Boolean(errors.expiresOn)}
                  helperText={errors.expiresOn ? errors.expiresOn.message : ""}
                />
              )}
            />
            <Controller
              name='createdOn'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Created On'
                  sx={{ my: 2 }}
                  error={Boolean(errors.createdOn)}
                  helperText={errors.createdOn ? errors.createdOn.message : ""}
                />
              )}
            />
            <Controller
              name='campaignId'
              control={control}
              render={({ field }) => (
                <mui.TextField
                  {...field}
                  label='Campaign ID'
                  sx={{ my: 2 }}
                  error={Boolean(errors.campaignId)}
                  helperText={
                    errors.campaignId ? errors.campaignId.message : ""
                  }
                />
              )}
            />

            <mui.Button type='submit'>Submit</mui.Button>
          </form>
        </mui.Box>
      </mui.Box>
    </mui.ThemeProvider>
  );
};

export default AddTasks;
