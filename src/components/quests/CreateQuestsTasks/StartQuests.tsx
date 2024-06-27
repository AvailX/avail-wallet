import * as React from "react";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as mui from "@mui/material";
import * as yup from "yup";
import TitleField from "./StartQuest/TitleField";
import DescribeField from "./StartQuest/DescribeField";
import BannerDesktop from "./StartQuest/BannerDesktop";
import BannerMobile from "./StartQuest/BannerMobile";
import QuestDuration from "./StartQuest/QuestDuration";
import {
  ContextProvider,
  useQuestContext,
} from "../../../views-desktop/quests/CreateTask";

const schema = yup.object().shape({
  taskTitle: yup.string().required("Title is required"),
  describeQuest: yup.string().required("Description is required"),
  desktopUrl: yup
    .string()
    .matches(
      /((https?):\/\/)/,
      "Enter correct url!"
    )
    .required("Please enter correct url"),
});

const StartQuests: React.FC<{ handleNext: () => void }> = ({
  handleNext,
}: {
  handleNext: () => void;
}) => {
  const { setFormField, formField } = useQuestContext();
  const methods = useForm({
    resolver: yupResolver(schema),
  });
  const {
    handleSubmit,
    formState: { errors },
  } = methods;
  const onSubmit = (data: any) => {
    console.log(data);
    setFormField({ ...formField, data });
    handleNext();
  };

  const onTest = () => {
    console.log("Form fffs", formField.data);
  };

  return (
    <ContextProvider>
      <FormProvider {...methods}>
        <mui.Box
          component='form'
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            display: "flex",
            flexDirection: "column",
            width: "100%",
          }}
        >
          <TitleField />
          {errors.taskTitle && (
            <mui.Typography color='error'>
              {errors.taskTitle.message}
            </mui.Typography>
          )}
          <DescribeField />
          {errors.describeQuest && (
            <mui.Typography color='error'>
              {errors.describeQuest.message}
            </mui.Typography>
          )}
          <BannerDesktop />
          {errors.desktopUrl && (
            <mui.Typography color='error'>
              {errors.desktopUrl.message}
            </mui.Typography>
          )}

          <QuestDuration />
          <mui.Button type='submit' variant='contained' color='primary'>
            Submit
          </mui.Button>
        </mui.Box>
      </FormProvider>
    </ContextProvider>
  );
};

export default StartQuests;
