/* eslint-disable @typescript-eslint/comma-dangle */
/* eslint-disable arrow-parens */
/* eslint-disable @typescript-eslint/consistent-type-assertions */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/array-type */

/* eslint-disable capitalized-comments */

/* eslint-disable @typescript-eslint/indent */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable @typescript-eslint/object-curly-spacing */
/* eslint-disable @typescript-eslint/quotes */
import * as React from "react";
import {
  useForm,
  useFieldArray,
  Controller,
  type FieldValues,
} from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import * as mui from "@mui/material";

import MenuItem from "@mui/material/MenuItem";

import { createQuest } from "../../../../services/quests/quests";

import CloseIcon from "@mui/icons-material/Close";

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
  tasks: yup.array().of(taskSchema).min(1, "At least one task is required"),
});

type DataObject = {
  title: string;
  description: string;
  transaction: string;
  program_id: string;
  function_id: string;
  points: number;
  dapp_url: string;
};

const AddTasks: React.FC = ({ setFormField, formField }: any) => {
  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      tasks: [
        {
          title: "",
          description: "",
          transaction: "",
          program_id: "",
          function_id: "",
          dapp_url: "",
          points: 0,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "tasks",
  });

  function reorderKeys(arr: Partial<DataObject>[]): DataObject[] {
    const keyOrder: Array<keyof DataObject> = [
      "title",
      "description",
      "transaction",
      "program_id",
      "function_id",
      "points",
      "dapp_url",
    ];

    return arr.map((obj: Partial<DataObject>) => {
      const newObj = {} as DataObject;
      keyOrder.forEach((key) => {
        if (obj[key] !== undefined) {
          newObj[key] = obj[key] as any;
        }
      });
      return newObj;
    });
  }

  const onSubmit = async (data: FieldValues) => {
    console.log(
      "Submit data",
      JSON.stringify(reorderKeys(data?.tasks as Partial<DataObject>[]))
    );

    setFormField({ task: { ...data?.tasks }, formField });
  };

  return (
    <>
      <button
        onClick={() => {
          console.log("Context", formField);
        }}
      >
        Hello world box
      </button>
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
                InputProps: {
                  style: { color: "#fff" },
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
            MuiSelect: {
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
        <form
          onSubmit={handleSubmit(onSubmit)}
          style={{ display: "flex", flexDirection: "column" }}
        >
          <mui.Box
            sx={{
              display: "flex",
              flexDirection: "column",
              width: "100%",
              mb: "5%",
            }}
          >
            <mui.Box
              display='flex'
              alignItems='center'
              justifyContent='space-between'
            >
              <mui.Typography variant='h4' color={"white"} fontWeight={"bold"}>
                Add Tasks
              </mui.Typography>
            </mui.Box>

            <mui.Box>
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <mui.Box
                    display='flex'
                    alignItems='center'
                    justifyContent='space-between'
                  >
                    <mui.Typography
                      variant='h6'
                      sx={{ my: 3 }}
                      color={"white"}
                      fontWeight={"bold"}
                    >
                      Tasks {index + 1}
                    </mui.Typography>
                    {index !== 0 && (
                      <mui.Button
                        onClick={() => {
                          remove(index);
                        }}
                        variant='outlined'
                      >
                        Delete
                      </mui.Button>
                    )}
                  </mui.Box>
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
                          errors?.tasks?.[index]?.title
                            ? errors?.tasks?.[index]?.title?.message
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
                            ? errors?.tasks?.[index]?.description?.message
                            : ""
                        }
                      />
                    )}
                  />
                  <Controller
                    name={`tasks.${index}.transaction`}
                    control={control}
                    render={({ field }) => (
                      <mui.FormControl
                        sx={{ my: 2, border: "1px solid primary" }}
                        error={Boolean(errors.tasks?.[index]?.transaction)}
                      >
                        <mui.InputLabel sx={{ color: "#696969" }}>
                          Transaction
                        </mui.InputLabel>
                        <mui.Select
                          sx={{
                            borderColor: "green",
                            "&.MuiInputBase-root": {
                              border: "1px solid #00FFAA",
                            },
                            color: "#fff",
                          }}
                          {...field}
                          label='Transaction'
                        >
                          <MenuItem value={"true"}>True</MenuItem>
                          <MenuItem value={"false"}>False</MenuItem>
                        </mui.Select>
                        <mui.FormHelperText>
                          {errors.tasks?.[index]?.transaction
                            ? errors?.tasks?.[index]?.transaction?.message
                            : ""}
                        </mui.FormHelperText>
                      </mui.FormControl>
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
                            ? errors?.tasks?.[index]?.program_id?.message
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
                            ? errors?.tasks?.[index]?.function_id?.message
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
                            ? errors?.tasks?.[index]?.dapp_url?.message
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
                            ? errors?.tasks?.[index]?.points?.message
                            : ""
                        }
                      />
                    )}
                  />
                </div>
              ))}

              <br />

              <mui.Button
                variant='outlined'
                sx={{ textTransform: "inherit", mb: 2 }}
                fullWidth
                onClick={() => {
                  append({
                    title: "",
                    description: "",
                    transaction: "",
                    program_id: "",
                    function_id: "",
                    dapp_url: "",
                    points: 0,
                  });
                }}
              >
                Add new
              </mui.Button>
              <mui.Button
                sx={{ textTransform: "inherit" }}
                variant='contained'
                type='submit'
                fullWidth
              >
                Submit
              </mui.Button>
            </mui.Box>
          </mui.Box>
        </form>
      </mui.ThemeProvider>
    </>
  );
};

export default AddTasks;
